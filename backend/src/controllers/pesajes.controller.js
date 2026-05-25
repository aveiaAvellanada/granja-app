import pool from '../config/db.postgres.js'

export async function getPesajes(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM gestion.pesaje ORDER BY fecha_pesaje DESC LIMIT 200'
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function registrarPesaje(req, res, next) {
  try {
    const { id_cerdo, peso_kg, id_empleado, observaciones } = req.body
    const result = await pool.query(
      `INSERT INTO gestion.pesaje (id_cerdo, peso_kg, id_empleado, observaciones)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [id_cerdo, peso_kg, id_empleado, observaciones ?? null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export async function getPendientes(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM gestion.fn_cerdos_sin_pesaje_reciente()')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
