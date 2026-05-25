import pool from '../config/db.postgres.js'

export async function getCochineras(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM infraestructura.vw_ocupacion_cochineras ORDER BY id_cochinera'
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function createCochinera(req, res, next) {
  try {
    const { capacidad_max, estado_cochinera } = req.body
    const result = await pool.query(
      `INSERT INTO infraestructura.cochinera (capacidad_max, estado_cochinera)
       VALUES ($1,$2) RETURNING *`,
      [capacidad_max, estado_cochinera ?? 'Disponible']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export async function updateCochinera(req, res, next) {
  try {
    const { id } = req.params
    const { estado_cochinera } = req.body
    const result = await pool.query(
      'UPDATE infraestructura.cochinera SET estado_cochinera = $1 WHERE id_cochinera = $2 RETURNING *',
      [estado_cochinera, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cochinera no encontrada' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}
