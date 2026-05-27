import pool from '../config/db.postgres.js'

// --- ALIMENTACIÓN ---

export async function getAlimentacion(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
         fecha AS fecha_registro,
         id_cerdo AS cerdo,
         nombre_item AS alimento,
         cantidad_consumida,
         unidad,
         registrado_por AS empleado,
         NULL::text AS observaciones
       FROM gestion.vw_consumo_alimento
       ORDER BY fecha DESC`
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function registrarAlimentacion(req, res, next) {
  try {
    const { id_cerdo, id_item, cantidad, id_unidad, observaciones } = req.body
    const id_empleado = req.user.id
    
    await pool.query(
      'SELECT gestion.sp_registrar_alimentacion($1,$2,$3,$4,$5,$6)',
      [id_cerdo, id_empleado, id_item, cantidad, id_unidad, observaciones ?? null]
    )
    res.status(201).json({ message: 'Alimentación registrada exitosamente' })
  } catch (err) {
    next(err)
  }
}

// --- REVISIÓN MÉDICA ---

export async function getRevision(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT 
        r.id_registro,
        r.fecha_registro,
        c.id_cerdo,
        (c.id_cerdo || ' - ' || rc.descripcion || ' - ' || 
         c.sexo_cerdo) AS cerdo,
        (e.p_nombre || ' ' || e.p_apellido) AS empleado,
        rm.diagnostico,
        i.nombre_item AS medicamento,
        r.observaciones
      FROM gestion.registro r
      JOIN gestion.revision_medica rm ON rm.id_registro = r.id_registro
      JOIN infraestructura.cerdo c ON c.id_cerdo = r.id_cerdo
      JOIN infraestructura.raza_ref rc ON rc.id_raza = c.id_raza
      JOIN personal.empleado e ON e.id_empleado = r.id_empleado
      LEFT JOIN gestion.inventario i 
        ON i.id_item = rm.id_medicamento_aplicado
      ORDER BY r.fecha_registro DESC
    `)
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function registrarRevision(req, res, next) {
  try {
    const { id_cerdo, diagnostico, id_medicamento, observaciones } = req.body
    const id_empleado = req.user.id

    await pool.query(
      'SELECT gestion.sp_registrar_revision_medica($1,$2,$3,$4,$5)',
      [id_cerdo, id_empleado, diagnostico, id_medicamento ?? null, observaciones ?? null]
    )
    res.status(201).json({ message: 'Revisión médica registrada exitosamente' })
  } catch (err) {
    next(err)
  }
}

// --- PESAJES ---

export async function getPesajes(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_pesaje,
        p.fecha_pesaje,
        c.id_cerdo,
        (c.id_cerdo || ' - ' || rc.descripcion || ' - ' || 
         c.sexo_cerdo) AS cerdo,
        (e.p_nombre || ' ' || e.p_apellido) AS empleado,
        p.peso_kg,
        p.observaciones
      FROM gestion.pesaje p
      JOIN infraestructura.cerdo c ON c.id_cerdo = p.id_cerdo
      JOIN infraestructura.raza_ref rc ON rc.id_raza = c.id_raza
      JOIN personal.empleado e ON e.id_empleado = p.id_empleado
      ORDER BY p.fecha_pesaje DESC
    `)
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getConsumoAlimento(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const fecha_ini = req.query.fecha_ini || firstOfMonth
    const fecha_fin = req.query.fecha_fin || today
    const result = await pool.query(
      'SELECT * FROM gestion.fn_consumo_alimento_por_periodo($1, $2)',
      [fecha_ini, fecha_fin]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function registrarPesaje(req, res, next) {
  try {
    const { id_cerdo, peso_kg, observaciones } = req.body
    const id_empleado = req.user.id

    const result = await pool.query(
      `INSERT INTO gestion.pesaje (id_cerdo, id_empleado, peso_kg, observaciones)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id_cerdo, id_empleado, peso_kg, observaciones ?? null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}
