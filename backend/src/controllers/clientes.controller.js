import pool from '../config/db.postgres.js'

export async function searchClientes(req, res, next) {
  try {
    const { cedula } = req.query;
    if (!cedula) return res.json([]);
    const result = await pool.query(
      `SELECT * FROM comercial.cliente 
       WHERE cedula_cliente ILIKE $1 AND estado_cliente = 'Activo' 
       ORDER BY p_apellido LIMIT 10`,
      [`%${cedula}%`]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function getClientes(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM comercial.cliente ORDER BY p_apellido'
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function createCliente(req, res, next) {
  try {
    const { p_nombre, s_nombre, p_apellido, s_apellido, cedula_cliente, telefono, correo_cliente, estado_cliente } = req.body
    const result = await pool.query(
      `INSERT INTO comercial.cliente (p_nombre, s_nombre, p_apellido, s_apellido, cedula_cliente, telefono, correo_cliente, estado_cliente)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [p_nombre, s_nombre ?? null, p_apellido, s_apellido ?? null, cedula_cliente, telefono ?? null, correo_cliente ?? null, estado_cliente ?? 'Activo']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export async function updateCliente(req, res, next) {
  try {
    const { id } = req.params
    const { estado_cliente } = req.body
    const result = await pool.query(
      'UPDATE comercial.cliente SET estado_cliente = $1 WHERE id_cliente = $2 RETURNING *',
      [estado_cliente, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}
