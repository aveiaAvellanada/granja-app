import pool from '../config/db.postgres.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function login(req, res, next) {
  try {
    const { usuario, contrasena } = req.body
    if (!usuario || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
    }

    // personal.administrador: login por correo_admin, contraseña en contrasena_admin
    const resultAdmin = await pool.query(
      `SELECT id_admin AS id,
              (p_nombre || ' ' || p_apellido) AS nombre,
              'administrador' AS rol
       FROM personal.administrador 
       WHERE correo_admin = $1 AND contrasena_admin = crypt($2, contrasena_admin)`,
      [usuario, contrasena]
    )

    let user = null;

    if (resultAdmin.rows.length > 0) {
      user = resultAdmin.rows[0];
    } else {
      const resultEmpleado = await pool.query(
        `SELECT id_empleado AS id,
                (p_nombre || ' ' || p_apellido) AS nombre,
                'empleado' AS rol
         FROM personal.empleado 
         WHERE correo_empleado = $1 AND contrasena_empleado = crypt($2, contrasena_empleado)`,
        [usuario, contrasena]
      )
      if (resultEmpleado.rows.length > 0) {
        user = resultEmpleado.rows[0];
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({ token, usuario: { id: user.id, nombre: user.nombre, rol: user.rol } })
  } catch (err) {
    next(err)
  }
}

export function me(req, res) {
  res.json(req.user)
}

export function logout(req, res) {
  res.json({ message: 'Sesión cerrada' })
}

export async function cambiarPassword(req, res, next) {
  try {
    const { contrasena_actual, contrasena_nueva } = req.body
    const { id, rol } = req.user

    if (!contrasena_actual || !contrasena_nueva) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' })
    }

    if (contrasena_nueva.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' })
    }

    let result
    if (rol === 'administrador') {
      // Verificar actual
      result = await pool.query(
        'SELECT id_admin FROM personal.administrador WHERE id_admin = $1 AND contrasena_admin = crypt($2, contrasena_admin)',
        [id, contrasena_actual]
      )
      if (result.rows.length === 0) return res.status(401).json({ error: 'Contraseña actual incorrecta' })
      
      // Actualizar
      await pool.query(
        "UPDATE personal.administrador SET contrasena_admin = crypt($1, gen_salt('bf', 12)) WHERE id_admin = $2",
        [contrasena_nueva, id]
      )
    } else {
      // Verificar actual
      result = await pool.query(
        'SELECT id_empleado FROM personal.empleado WHERE id_empleado = $1 AND contrasena_empleado = crypt($2, contrasena_empleado)',
        [id, contrasena_actual]
      )
      if (result.rows.length === 0) return res.status(401).json({ error: 'Contraseña actual incorrecta' })
      
      // Actualizar
      await pool.query(
        "UPDATE personal.empleado SET contrasena_empleado = crypt($1, gen_salt('bf', 12)) WHERE id_empleado = $2",
        [contrasena_nueva, id]
      )
    }

    res.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (err) {
    next(err)
  }
}
