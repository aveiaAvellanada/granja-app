import pool from '../config/db.postgres.js'

export async function getRazas(req, res, next) {
  try {
    const result = await pool.query('SELECT id_raza, descripcion FROM infraestructura.raza_ref ORDER BY descripcion')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
