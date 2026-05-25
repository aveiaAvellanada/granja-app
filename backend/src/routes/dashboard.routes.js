import { Router } from 'express'
import { getResumen, getAlertas, getVentasAnio, getCochineras } from '../controllers/dashboard.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/resumen', getResumen)
router.get('/alertas', getAlertas)
router.get('/ventas/:anio', getVentasAnio)
router.get('/cochineras', getCochineras)

export default router
