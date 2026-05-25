import { Router } from 'express'
import { getVentas, registrarVenta, anularFactura, getDashboardVentas } from '../controllers/ventas.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getVentas)
router.post('/', registrarVenta)
router.put('/:id/anular', anularFactura)
router.get('/dashboard/:anio', getDashboardVentas)

export default router
