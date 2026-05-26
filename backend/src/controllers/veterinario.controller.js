import pool from '../config/db.postgres.js'

export async function getPendientes(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM gestion.fn_cerdos_sin_revision_reciente(30)')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
