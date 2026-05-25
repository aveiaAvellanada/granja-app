import pool from '../config/db.postgres.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function login(req, res, next) {
  try {
    const { usuario, contrasena } = req.body
    if (!usuario || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
    }

    let result = await pool.query(
      `SELECT id_administrador AS id, nombre, contrasena, 'administrador' AS rol
       FROM personal.administrador WHERE usuario = $1`,
      [usuario]
    )

    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT id_empleado AS id, nombre, contrasena, cargo AS rol
         FROM personal.empleado WHERE usuario = $1`,
        [usuario]
      )
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(contrasena, user.contrasena)
    if (!valid) {
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
