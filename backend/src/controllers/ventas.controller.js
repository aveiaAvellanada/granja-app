import pool from '../config/db.postgres.js'
import { getMongo } from '../config/db.mongo.js'

export async function getVentas(req, res, next) {
  try {
    const { fecha_inicio, fecha_fin } = req.query
    const hoy = new Date().toISOString().split('T')[0]
    const result = await pool.query(
      'SELECT * FROM comercial.fn_ventas_por_periodo($1,$2)',
      [fecha_inicio ?? '2000-01-01', fecha_fin ?? hoy]
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function registrarVenta(req, res, next) {
  try {
    const { id_cliente, id_empleado, ids_cerdos, precios } = req.body
    await pool.query(
      'SELECT comercial.sp_registrar_venta($1,$2,$3,$4)',
      [id_cliente, id_empleado, ids_cerdos, precios]
    )
    res.status(201).json({ message: 'Venta registrada' })
  } catch (err) {
    next(err)
  }
}

export async function anularFactura(req, res, next) {
  try {
    const { id } = req.params
    await pool.query('SELECT comercial.sp_anular_factura($1)', [id])
    res.json({ message: 'Factura anulada' })
  } catch (err) {
    next(err)
  }
}

export async function getDashboardVentas(req, res, next) {
  try {
    const { anio } = req.params
    const db = getMongo()
    const cache = await db.collection('dashboard_cache').findOne({ tipo: 'ventas', anio: Number(anio) })
    if (cache) {
      return res.json(cache.datos)
    }
    const result = await pool.query('SELECT * FROM comercial.fn_dashboard_ventas($1)', [anio])
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getDetalleVenta(req, res, next) {
  try {
    const { id } = req.params
    const result = await pool.query(`
      SELECT df.id_cerdo, df.precio_venta_cop,
             c.sexo_cerdo, r.descripcion AS raza
      FROM comercial.detalle_factura df
      JOIN infraestructura.cerdo c ON c.id_cerdo = df.id_cerdo
      JOIN infraestructura.raza_ref r ON r.id_raza = c.id_raza
      WHERE df.id_factura = $1
    `, [id])
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
