import pool from '../config/db.postgres.js'
import { getMongo } from '../config/db.mongo.js'

export async function getResumen(req, res, next) {
  try {
    const db = getMongo()
    const cache = await db.collection('dashboard_cache').findOne({ tipo: 'resumen' })
    if (cache) return res.json(cache.datos)

    const [cerdos, cochineras, alertas] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM infraestructura.vw_cerdos_activos'),
      pool.query('SELECT * FROM infraestructura.vw_ocupacion_cochineras'),
      pool.query('SELECT * FROM gestion.vw_alertas_operativas'),
    ])

    res.json({
      total_cerdos: Number(cerdos.rows[0].total),
      cochineras: cochineras.rows,
      alertas: alertas.rows,
    })
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
