import pool from '../config/db.postgres.js'
import { getMongo } from '../config/db.mongo.js'

const SYNC_INTERVAL_MS = 5 * 60 * 1000   // 5 minutos
const CACHE_INTERVAL_MS = 60 * 60 * 1000 // 1 hora

async function syncEventos() {
  try {
    const db = getMongo()
    const { rows: eventos } = await pool.query(
      `SELECT * FROM auditoria.eventos
       WHERE sincronizado = FALSE
       ORDER BY fecha_hora
       LIMIT 500`
    )

    if (eventos.length === 0) return

    await db.collection('auditoria_eventos').insertMany(eventos)

    const ids = eventos.map((e) => e.id_evento)
    await pool.query(
      'UPDATE auditoria.eventos SET sincronizado = TRUE WHERE id_evento = ANY($1)',
      [ids]
    )

    console.log(`[sync] ${eventos.length} eventos sincronizados`)
  } catch (err) {
    console.error('[sync] Error sincronizando eventos:', err.message)
  }
}

async function syncReporteMensual() {
  try {
    const now = new Date()
    if (now.getDate() !== 1) return

    const db = getMongo()
    const anio = now.getFullYear()
    const mes = now.getMonth() === 0 ? 12 : now.getMonth()
    const anioReporte = mes === 12 ? anio - 1 : anio

    const existe = await db.collection('reportes_mensuales').findOne({ anio: anioReporte, mes })
    if (existe) return

    const { rows } = await pool.query('SELECT * FROM gestion.fn_reporte_mensual($1,$2)', [anioReporte, mes])
    await db.collection('reportes_mensuales').insertOne({
      anio: anioReporte,
      mes,
      datos: rows,
      generado_en: new Date(),
    })
    console.log(`[sync] Reporte mensual ${anioReporte}-${mes} guardado`)
  } catch (err) {
    console.error('[sync] Error reporte mensual:', err.message)
  }
}

async function refreshDashboardCache() {
  try {
    const db = getMongo()
    const col = db.collection('dashboard_cache')
    const anio = new Date().getFullYear()

    const [alertas, ventas, cochineras] = await Promise.all([
      pool.query('SELECT * FROM gestion.vw_alertas_operativas'),
      pool.query('SELECT * FROM comercial.fn_dashboard_ventas($1)', [anio]),
      pool.query('SELECT * FROM infraestructura.vw_ocupacion_cochineras'),
    ])

    const upsert = (tipo, datos, extra = {}) =>
      col.updateOne(
        { tipo, ...extra },
        { $set: { datos, actualizado_en: new Date() } },
        { upsert: true }
      )

    await Promise.all([
      upsert('alertas_operativas', alertas.rows),
      upsert('ventas', ventas.rows, { anio }),
      upsert('cochineras', cochineras.rows),
    ])

    console.log('[sync] Dashboard cache actualizado')
  } catch (err) {
    console.error('[sync] Error actualizando cache:', err.message)
  }
}

export function startSyncWorker() {
  console.log('[sync] Worker iniciado')

  syncEventos()
  syncReporteMensual()
  refreshDashboardCache()

  setInterval(syncEventos, SYNC_INTERVAL_MS)
  setInterval(syncReporteMensual, SYNC_INTERVAL_MS)
  setInterval(refreshDashboardCache, CACHE_INTERVAL_MS)
}
