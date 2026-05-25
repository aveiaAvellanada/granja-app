import pool from '../config/db.postgres.js'
import { getMongo } from '../config/db.mongo.js'

export async function getVentas(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT 
        f.id_factura,
        f.fecha_venta,
        f.estado_factura,
        (c.p_nombre || ' ' || c.p_apellido) AS cliente,
        (e.p_nombre || ' ' || e.p_apellido) AS empleado,
        COALESCE(SUM(df.precio_venta_cop), 0) AS total_cop,
        COUNT(df.id_cerdo) AS cantidad_cerdos
      FROM comercial.factura f
      JOIN comercial.cliente c ON c.id_cliente = f.id_cliente
      JOIN personal.empleado e ON e.id_empleado = f.id_empleado
      LEFT JOIN comercial.detalle_factura df ON df.id_factura = f.id_factura
      GROUP BY f.id_factura, f.fecha_venta, f.estado_factura,
               c.p_nombre, c.p_apellido, e.p_nombre, e.p_apellido
      ORDER BY f.fecha_venta DESC
    `)
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function registrarVenta(req, res, next) {
  try {
    const { id_cliente, ids_cerdos, precios } = req.body
    const id_empleado = req.user.id

    if (!ids_cerdos || !precios || ids_cerdos.length === 0 || ids_cerdos.length !== precios.length) {
      return res.status(400).json({ error: 'La cantidad de cerdos y precios no coincide o está vacía' })
    }

    if (precios.some(p => p <= 0)) {
      return res.status(400).json({ error: 'Todos los precios deben ser mayores a 0' })
    }

    const result = await pool.query(
      'SELECT comercial.sp_registrar_venta($1,$2,$3,$4) AS id_factura',
      [id_cliente, id_empleado, ids_cerdos, precios]
    )
    res.status(201).json({ message: 'Venta registrada', id_factura: result.rows[0].id_factura })
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
      SELECT 
        df.id_cerdo,
        df.precio_venta_cop,
        c2.sexo_cerdo,
        r.descripcion AS raza,
        (cl.p_nombre || ' ' || cl.p_apellido) AS nombre_cliente,
        cl.cedula_cliente,
        cl.telefono AS telefono_cliente,
        cl.correo_cliente,
        (e.p_nombre || ' ' || e.p_apellido) AS nombre_empleado,
        f.fecha_venta,
        f.estado_factura
      FROM comercial.detalle_factura df
      JOIN comercial.factura f ON f.id_factura = df.id_factura
      JOIN comercial.cliente cl ON cl.id_cliente = f.id_cliente
      JOIN personal.empleado e ON e.id_empleado = f.id_empleado
      JOIN infraestructura.cerdo c2 ON c2.id_cerdo = df.id_cerdo
      JOIN infraestructura.raza_ref r ON r.id_raza = c2.id_raza
      WHERE df.id_factura = $1
    `, [id])
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
