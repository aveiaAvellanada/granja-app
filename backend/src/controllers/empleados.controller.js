import pool from '../config/db.postgres.js'

export async function getEmpleados(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id_empleado, p_nombre, s_nombre, p_apellido, s_apellido,
              cedula_empleado, estado_empleado, correo_empleado
       FROM personal.empleado ORDER BY p_apellido`
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function createEmpleado(req, res, next) {
  try {
    const { p_nombre, s_nombre, p_apellido, s_apellido, cedula_empleado, estado_empleado, correo_empleado, contrasena } = req.body
    const id_admin = req.user.id
    const result = await pool.query(
      `INSERT INTO personal.empleado
         (p_nombre, s_nombre, p_apellido, s_apellido, cedula_empleado, estado_empleado, id_admin, correo_empleado, contrasena_empleado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,crypt($9, gen_salt('bf', 12)))
       RETURNING id_empleado, p_nombre, p_apellido, cedula_empleado, estado_empleado, correo_empleado`,
      [p_nombre, s_nombre ?? null, p_apellido, s_apellido ?? null,
       cedula_empleado, estado_empleado ?? 'Activo', id_admin, correo_empleado, contrasena]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export async function updateEmpleado(req, res, next) {
  try {
    const { id } = req.params
    const { estado_empleado } = req.body
    const result = await pool.query(
      `UPDATE personal.empleado SET estado_empleado = $1
       WHERE id_empleado = $2
       RETURNING id_empleado, p_nombre, p_apellido, estado_empleado`,
      [estado_empleado, id]
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
