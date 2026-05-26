import pool from '../config/db.postgres.js'
import { getMongo } from '../config/db.mongo.js'

export async function getResumen(req, res, next) {
  try {
    const db = getMongo()
    const cache = await db.collection('dashboard_cache').findOne({ tipo: 'resumen' })
    if (cache) return res.json(cache.datos)

    const query = `
      SELECT 
        (SELECT COUNT(*) FROM infraestructura.cerdo WHERE estado_cerdo = 'Activo') AS cerdos_activos,
        (SELECT COUNT(*) FROM infraestructura.cerdo WHERE estado_cerdo = 'Vendido') AS cerdos_vendidos,
        (SELECT COUNT(*) FROM infraestructura.cerdo WHERE estado_cerdo = 'Muerto') AS cerdos_muertos,
        (SELECT COUNT(*) FROM infraestructura.cochinera) AS total_cochineras,
        (SELECT COALESCE(SUM(df.precio_venta_cop), 0)
         FROM comercial.detalle_factura df
         JOIN comercial.factura f ON f.id_factura = df.id_factura
         WHERE DATE_TRUNC('month', f.fecha_venta) = DATE_TRUNC('month', CURRENT_DATE)
         AND f.estado_factura = 'Completada') AS ingresos_mes_actual,
        (SELECT COUNT(*) FROM gestion.fn_inventario_bajo(10)) AS items_stock_bajo
    `;
    const result = await pool.query(query)
    
    // Maintain backwards compatibility with the previous object structure if needed, 
    // but the request asks for specific fields.
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

export async function getMortalidad(req, res, next) {
  try {
    const query = `
      SELECT * FROM infraestructura.vw_mortalidad_por_mes
      ORDER BY anio DESC, mes DESC
      LIMIT 12
    `
    const result = await pool.query(query)
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getOcupacion(req, res, next) {
  try {
    const query = `
      SELECT * FROM infraestructura.vw_ocupacion_cochineras
      ORDER BY id_cochinera
    `
    const result = await pool.query(query)
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getActividad(req, res, next) {
  try {
    const query = `
      SELECT 'venta' AS tipo,
        'Factura #' || f.id_factura AS descripcion,
        f.fecha_venta AS fecha,
        (cl.p_nombre || ' ' || cl.p_apellido) AS detalle
      FROM comercial.factura f
      JOIN comercial.cliente cl ON cl.id_cliente = f.id_cliente
      UNION ALL
      SELECT 'traslado',
        'Cerdo #' || ht.id_cerdo || ' trasladado',
        ht.fecha_traslado,
        'Cochinera ' || ht.id_cochinera_destino
      FROM infraestructura.historial_traslado ht
      UNION ALL
      SELECT 'registro',
        'Registro cerdo #' || r.id_cerdo,
        r.fecha_registro,
        cr.descripcion
      FROM gestion.registro r
      JOIN gestion.categoria_registro_ref cr 
        ON cr.id_categoria = r.id_categoria
      ORDER BY fecha DESC
      LIMIT 8
    `
    const result = await pool.query(query)
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getAlertas(req, res, next) {
  try {
    const db = getMongo()
    const cache = await db.collection('dashboard_cache').findOne({ tipo: 'alertas_operativas' })
    if (cache) return res.json(cache.datos)

    const result = await pool.query('SELECT * FROM gestion.vw_alertas_operativas')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getVentasAnio(req, res, next) {
  try {
    const { anio } = req.params
    const db = getMongo()
    const cache = await db.collection('dashboard_cache').findOne({ tipo: 'ventas', anio: Number(anio) })
    if (cache) return res.json(cache.datos)

    const result = await pool.query('SELECT * FROM comercial.fn_dashboard_ventas($1)', [anio])
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

export async function getCochineras(req, res, next) {
  try {
    const db = getMongo()
    const cache = await db.collection('dashboard_cache').findOne({ tipo: 'cochineras' })
    if (cache) return res.json(cache.datos)

    const result = await pool.query('SELECT * FROM infraestructura.vw_ocupacion_cochineras')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
