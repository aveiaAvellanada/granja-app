import pool from '../config/db.postgres.js'

export async function getInventario(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT i.*, t.descripcion AS tipo_descripcion,
              u.nombre AS unidad_nombre, u.abreviatura
       FROM gestion.inventario i
       JOIN gestion.tipo_item_ref t ON t.id_tipo_item = i.id_tipo_item
       JOIN gestion.unidad_medida_ref u ON u.id_unidad = i.id_unidad_base
       ORDER BY i.id_tipo_item, i.nombre_item`
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getAlertas(req, res, next) {
  try {
    const umbral = req.query.umbral ?? 10
    const result = await pool.query(
      `SELECT i.*, t.descripcion AS tipo_descripcion,
              u.nombre AS unidad_nombre, u.abreviatura
       FROM gestion.fn_inventario_bajo($1) f
       JOIN gestion.inventario i ON i.id_item = f.id_item
       JOIN gestion.tipo_item_ref t ON t.id_tipo_item = i.id_tipo_item
       JOIN gestion.unidad_medida_ref u ON u.id_unidad = i.id_unidad_base`,
      [umbral]
    )
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
    const { cantidad_stock, estado_item } = req.body
    
    let query = 'UPDATE gestion.inventario SET '
    const params = []
    const updates = []

    if (cantidad_stock !== undefined) {
      params.push(cantidad_stock)
      updates.push(`cantidad_stock = $${params.length}`)
    }
    if (estado_item !== undefined) {
      params.push(estado_item)
      updates.push(`estado_item = $${params.length}`)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' })
    }

    params.push(id)
    query += updates.join(', ') + ` WHERE id_item = $${params.length} RETURNING *`

    const result = await pool.query(query, params)
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}
