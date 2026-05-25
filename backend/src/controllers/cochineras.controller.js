import pool from '../config/db.postgres.js'

export async function getCochineras(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM infraestructura.vw_ocupacion_cochineras ORDER BY nombre')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function createCochinera(req, res, next) {
  try {
    const { nombre, capacidad, tipo, descripcion } = req.body
    const result = await pool.query(
      `INSERT INTO infraestructura.cochinera (nombre, capacidad, tipo, descripcion)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [nombre, capacidad, tipo, descripcion ?? null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export async function updateCochinera(req, res, next) {
  try {
    const { id } = req.params
    const { estado } = req.body
    const result = await pool.query(
      'UPDATE infraestructura.cochinera SET estado = $1 WHERE id_cochinera = $2 RETURNING *',
      [estado, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cochinera no encontrada' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}
