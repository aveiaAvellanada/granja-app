import pool from '../config/db.postgres.js'

export async function getCerdos(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM infraestructura.vw_cerdos_activos ORDER BY id_cerdo DESC')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getCerdo(req, res, next) {
  try {
    const { id } = req.params
    const [cerdo, genealogia] = await Promise.all([
      pool.query(`
        SELECT c.*, r.descripcion AS raza,
               (SELECT id_cochinera_destino 
                FROM infraestructura.historial_traslado 
                WHERE id_cerdo = c.id_cerdo 
                ORDER BY fecha_traslado DESC LIMIT 1) as id_cochinera_actual,
               (CURRENT_DATE - c.fecha_nacimiento) as edad_dias,
               (SELECT peso_kg FROM gestion.pesaje WHERE id_cerdo = c.id_cerdo ORDER BY fecha_pesaje DESC LIMIT 1) as ultimo_peso_kg
        FROM infraestructura.cerdo c
        JOIN infraestructura.raza_ref r ON r.id_raza = c.id_raza
        WHERE c.id_cerdo = $1`, [id]),
      pool.query(`
        SELECT g.*, r.descripcion AS raza
        FROM infraestructura.fn_arbol_genealogico($1) g
        JOIN infraestructura.cerdo c ON c.id_cerdo = g.id_cerdo
        JOIN infraestructura.raza_ref r ON r.id_raza = c.id_raza`, [id]),
    ])
    if (cerdo.rows.length === 0) {
      return res.status(404).json({ error: 'Cerdo no encontrado' })
    }
    res.json({ cerdo: cerdo.rows[0], genealogia: genealogia.rows })
  } catch (err) {
    next(err)
  }
}

export async function registrarCerdo(req, res, next) {
  try {
    const { sexo, id_raza, fecha_nac, id_padre, id_madre, id_cochinera } = req.body
    await pool.query(
      'SELECT infraestructura.sp_registrar_cerdo($1,$2,$3,$4,$5,$6)',
      [sexo, id_raza, fecha_nac, id_padre ?? null, id_madre ?? null, id_cochinera]
    )
    res.status(201).json({ message: 'Cerdo registrado' })
  } catch (err) {
    next(err)
  }
}

export async function trasladarCerdo(req, res, next) {
  try {
    const { id } = req.params
    const { id_cochinera_destino, motivo } = req.body
    await pool.query(
      'SELECT infraestructura.sp_trasladar_cerdo($1,$2,$3)',
      [id, id_cochinera_destino, motivo]
    )
    res.json({ message: 'Cerdo trasladado' })
  } catch (err) {
    next(err)
  }
}

export async function registrarMuerte(req, res, next) {
  try {
    const { id } = req.params
    const { causa, metodo_disposicion } = req.body
    await pool.query(
      'SELECT infraestructura.sp_registrar_muerte($1,$2,$3)',
      [id, causa, metodo_disposicion]
    )
    res.json({ message: 'Muerte registrada' })
  } catch (err) {
    next(err)
  }
}

export async function getHistorialPeso(req, res, next) {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT * FROM gestion.vw_historial_peso_cerdo WHERE id_cerdo = $1 ORDER BY fecha_pesaje',
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getVentaCerdo(req, res, next) {
  try {
    const { id } = req.params
    const result = await pool.query(`
      SELECT 
        f.id_factura,
        f.fecha_venta,
        f.estado_factura,
        df.precio_venta_cop,
        (cl.p_nombre || ' ' || cl.p_apellido) AS cliente,
        cl.cedula_cliente,
        cl.telefono
      FROM comercial.detalle_factura df
      JOIN comercial.factura f ON f.id_factura = df.id_factura
      JOIN comercial.cliente cl ON cl.id_cliente = f.id_cliente
      WHERE df.id_cerdo = $1`,
      [id]
    )
    res.json(result.rows[0] || null)
  } catch (err) {
    next(err)
  }
}

export async function getMortalidadCerdo(req, res, next) {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT fecha_deceso, causa_muerte, metodo_disposicion FROM infraestructura.mortalidad WHERE id_cerdo = $1',
      [id]
    )
    res.json(result.rows[0] || null)
  } catch (err) {
    next(err)
  }
}

export async function getTrasladosCerdo(req, res, next) {
  try {
    const { id } = req.params
    const result = await pool.query(`
      SELECT 
        ht.id_traslado,
        ht.fecha_traslado,
        ht.id_cochinera_origen,
        ht.id_cochinera_destino,
        ht.motivo
      FROM infraestructura.historial_traslado ht
      WHERE ht.id_cerdo = $1
      ORDER BY ht.fecha_traslado DESC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getAlimentacionCerdo(req, res, next) {
  try {
    const { id } = req.params
    const result = await pool.query(`
      SELECT 
        r.fecha_registro,
        (e.p_nombre || ' ' || e.p_apellido) AS empleado,
        i.nombre_item AS alimento,
        a.cantidad_consumida,
        u.abreviatura AS unidad,
        r.observaciones
      FROM gestion.registro r
      JOIN gestion.alimentacion a ON a.id_registro = r.id_registro
      JOIN personal.empleado e ON e.id_empleado = r.id_empleado
      JOIN gestion.inventario i ON i.id_item = a.id_item
      JOIN gestion.unidad_medida_ref u ON u.id_unidad = a.id_unidad
      WHERE r.id_cerdo = $1
      ORDER BY r.fecha_registro DESC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getRevisionesCerdo(req, res, next) {
  try {
    const { id } = req.params
    const result = await pool.query(`
      SELECT 
        r.fecha_registro,
        (e.p_nombre || ' ' || e.p_apellido) AS empleado,
        rm.diagnostico,
        i.nombre_item AS medicamento,
        r.observaciones
      FROM gestion.registro r
      JOIN gestion.revision_medica rm ON rm.id_registro = r.id_registro
      JOIN personal.empleado e ON e.id_empleado = r.id_empleado
      LEFT JOIN gestion.inventario i 
        ON i.id_item = rm.id_medicamento_aplicado
      WHERE r.id_cerdo = $1
      ORDER BY r.fecha_registro DESC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getPesajesCerdo(req, res, next) {
  try {
    const { id } = req.params
    const result = await pool.query(`
      SELECT 
        p.fecha_pesaje,
        (e.p_nombre || ' ' || e.p_apellido) AS empleado,
        p.peso_kg,
        p.observaciones
      FROM gestion.pesaje p
      JOIN personal.empleado e ON e.id_empleado = p.id_empleado
      WHERE p.id_cerdo = $1
      ORDER BY p.fecha_pesaje DESC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
