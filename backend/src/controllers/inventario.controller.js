import pool from '../config/db.postgres.js'

export async function getInventario(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM gestion.vw_inventario_disponible ORDER BY nombre_item'
    )
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
    const { nombre_item, id_tipo_item, cantidad_stock, id_unidad_base, estado_item } = req.body
    const result = await pool.query(
      `INSERT INTO gestion.inventario (nombre_item, id_tipo_item, cantidad_stock, id_unidad_base, estado_item)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre_item, id_tipo_item, cantidad_stock ?? 0, id_unidad_base, estado_item ?? 'Disponible']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export async function updateStock(req, res, next) {
  try {
    const { id } = req.params
    const { cantidad_stock } = req.body
    const result = await pool.query(
      'UPDATE gestion.inventario SET cantidad_stock = $1 WHERE id_item = $2 RETURNING *',
      [cantidad_stock, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}
