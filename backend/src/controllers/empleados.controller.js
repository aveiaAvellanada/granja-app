import pool from '../config/db.postgres.js'
import bcrypt from 'bcrypt'

export async function getEmpleados(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id_empleado, nombre, cargo, usuario, telefono, estado FROM personal.empleado ORDER BY nombre'
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function createEmpleado(req, res, next) {
  try {
    const { nombre, cargo, usuario, contrasena, telefono } = req.body
    const hash = await bcrypt.hash(contrasena, 10)
    const result = await pool.query(
      `INSERT INTO personal.empleado (nombre, cargo, usuario, contrasena, telefono)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id_empleado, nombre, cargo, usuario, telefono`,
      [nombre, cargo, usuario, hash, telefono ?? null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export async function updateEmpleado(req, res, next) {
  try {
    const { id } = req.params
    const { estado } = req.body
    const result = await pool.query(
      'UPDATE personal.empleado SET estado = $1 WHERE id_empleado = $2 RETURNING id_empleado, nombre, estado',
      [estado, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export async function getActividadEmpleado(req, res, next) {
  try {
    const { id } = req.params
    const { fecha_ini, fecha_fin } = req.query
    const result = await pool.query(
      'SELECT * FROM personal.fn_actividad_empleado($1,$2,$3)',
      [id, fecha_ini, fecha_fin]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
