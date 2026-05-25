import pool from '../config/db.postgres.js'

export async function getPendientes(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM gestion.fn_cerdos_sin_revision_reciente()')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function registrarRevision(req, res, next) {
  try {
    const { id_cerdo, id_empleado, diagnostico, id_medicamento, observaciones } = req.body
    await pool.query(
      'SELECT gestion.sp_registrar_revision_medica($1,$2,$3,$4,$5)',
      [id_cerdo, id_empleado, diagnostico, id_medicamento ?? null, observaciones ?? null]
    )
    res.status(201).json({ message: 'Revisión médica registrada' })
  } catch (err) {
    next(err)
  }
}

export async function getHistorialCerdo(req, res, next) {
  try {
    const { id_cerdo } = req.params
    const result = await pool.query(
      `SELECT * FROM gestion.revision_medica
       WHERE id_cerdo = $1 ORDER BY fecha DESC`,
      [id_cerdo]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
