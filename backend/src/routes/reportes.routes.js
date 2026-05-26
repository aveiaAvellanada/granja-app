import { Router } from 'express'
import { 
  getReportesMensuales, 
  generarReporteMes, 
  getAuditoriaEventos, 
  getAppLogs, 
  getDashboardCache 
} from '../controllers/reportes.controller.js'

const router = Router()

router.get('/mensuales', getReportesMensuales)
router.post('/mensuales/generar', generarReporteMes)
router.get('/auditoria', getAuditoriaEventos)
router.get('/logs', getAppLogs)
router.get('/cache', getDashboardCache)

export default router
