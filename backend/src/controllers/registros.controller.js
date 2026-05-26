import pool from '../config/db.postgres.js'

// --- ALIMENTACIÓN ---

export async function getAlimentacion(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT 
        r.id_registro,
        r.fecha_registro,
        (c.id_cerdo || ' - ' || rc.descripcion || ' - ' || 
         c.sexo_cerdo) AS cerdo,
        c.id_cerdo,
        (e.p_nombre || ' ' || e.p_apellido) AS empleado,
        i.nombre_item AS alimento,
        a.cantidad_consumida,
        u.abreviatura AS unidad,
        r.observaciones
      FROM gestion.registro r
      JOIN gestion.alimentacion a ON a.id_registro = r.id_registro
      JOIN infraestructura.cerdo c ON c.id_cerdo = r.id_cerdo
      JOIN infraestructura.raza_ref rc ON rc.id_raza = c.id_raza
      JOIN personal.empleado e ON e.id_empleado = r.id_empleado
      JOIN gestion.inventario i ON i.id_item = a.id_item
      JOIN gestion.unidad_medida_ref u ON u.id_unidad = a.id_unidad
      ORDER BY r.fecha_registro DESC
    `)
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
