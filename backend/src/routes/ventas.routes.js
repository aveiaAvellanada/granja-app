import { Router } from 'express'
import { getVentas, registrarVenta, anularFactura, getDashboardVentas, getDetalleVenta, getCerdosVendibles, getVentasPorCliente } from '../controllers/ventas.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getVentas)
router.post('/', registrarVenta)
router.put('/:id/anular', anularFactura)
router.get('/dashboard/:anio', getDashboardVentas)
router.get('/cerdos-vendibles', getCerdosVendibles)
router.get('/por-cliente', getVentasPorCliente)
router.get('/:id/detalle', getDetalleVenta)

export default router
