import pool from '../config/db.postgres.js'

export async function getInventario(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM gestion.vw_inventario_disponible ORDER BY nombre')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getAlertas(req, res, next) {
  try {
    const umbral = req.query.umbral ?? 10
    const result = await pool.query('SELECT * FROM gestion.fn_inventario_bajo($1)', [umbral])
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function createItem(req, res, next) {
  try {
    const { nombre, tipo, stock, id_unidad, precio_unitario } = req.body
    const result = await pool.query(
      `INSERT INTO gestion.item_inventario (nombre, tipo, stock, id_unidad, precio_unitario)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre, tipo, stock, id_unidad, precio_unitario ?? null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export async function updateStock(req, res, next) {
  try {
    const { id } = req.params
    const { stock } = req.body
    const result = await pool.query(
      'UPDATE gestion.item_inventario SET stock = $1 WHERE id_item = $2 RETURNING *',
      [stock, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}
