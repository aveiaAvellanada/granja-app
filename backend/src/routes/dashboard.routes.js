import { Router } from 'express'
import { 
  getResumen, 
  getAlertas, 
  getVentasAnio, 
  getCochineras,
  getMortalidad,
  getOcupacion,
  getActividad
} from '../controllers/dashboard.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/resumen', getResumen)
router.get('/alertas', getAlertas)
router.get('/ventas/:anio', getVentasAnio)
router.get('/cochineras', getCochineras)
router.get('/mortalidad', getMortalidad)
router.get('/ocupacion', getOcupacion)
router.get('/actividad', getActividad)

export default router
