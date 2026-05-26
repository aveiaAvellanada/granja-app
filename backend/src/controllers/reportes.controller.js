import { getMongo } from '../config/db.mongo.js'
import pool from '../config/db.postgres.js'

function getNombreMes(mes) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return meses[mes - 1]
}

export async function getReportesMensuales(req, res, next) {
  try {
    const db = getMongo()
    const reportes = await db.collection('reportes_mensuales')
      .find({})
      .sort({ anio: -1, mes: -1 })
      .toArray()
    res.json(reportes)
  } catch (err) {
    next(err)
  }
}

export async function generarReporteMes(req, res, next) {
  try {
    const { anio, mes } = req.body
    const db = getMongo()

    // 1. Obtener datos de PostgreSQL
    const pgResult = await pool.query('SELECT * FROM gestion.fn_reporte_mensual($1, $2)', [anio, mes])
    const resultado = pgResult.rows

    // 2. Formatear métricas
    const metricas = {}
    resultado.forEach(row => {
      metricas[row.metrica] = row.valor
    })

    // 3. Upsert en MongoDB
    await db.collection('reportes_mensuales').updateOne(
      { anio, mes },
      { 
        $set: { 
          anio, mes,
          nombre_mes: getNombreMes(mes),
          metricas,
          fecha_generado: new Date(),
          fuente: 'postgresql'
        }
      },
      { upsert: true }
    )

    res.json({ message: `Reporte de ${getNombreMes(mes)} ${anio} generado exitosamente` })
  } catch (err) {
    next(err)
  }
}

export async function getAuditoriaEventos(req, res, next) {
  try {
    const { tabla, accion, limite = 100 } = req.query
    const db = getMongo()
    
    const filtro = {}
    if (tabla) filtro.tabla_origen = tabla
    if (accion) filtro.accion = accion

    const eventos = await db.collection('auditoria_eventos')
      .find(filtro)
      .sort({ fecha_hora: -1 })
      .limit(Number(limite))
      .toArray()
    
    res.json(eventos)
  } catch (err) {
    next(err)
  }
}

export async function getAppLogs(req, res, next) {
  try {
    const { nivel, limite = 50 } = req.query
    const db = getMongo()

    const filtro = {}
    if (nivel) filtro.nivel = nivel

    const logs = await db.collection('app_logs')
      .find(filtro)
      .sort({ fecha: -1 })
      .limit(Number(limite))
      .toArray()
    
    res.json(logs)
  } catch (err) {
    next(err)
  }
}

export async function getDashboardCache(req, res, next) {
  try {
    const db = getMongo()
    const cache = await db.collection('dashboard_cache')
      .find({})
      .toArray()
    res.json(cache)
  } catch (err) {
    next(err)
  }
}
