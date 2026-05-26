import { Router } from 'express'
import {
  getCerdos,
  getCerdo,
  registrarCerdo,
  trasladarCerdo,
  registrarMuerte,
  getHistorialPeso,
  getVentaCerdo,
  getMortalidadCerdo,
  getTrasladosCerdo,
  getAlimentacionCerdo,
  getRevisionesCerdo,
  getPesajesCerdo,
} from '../controllers/cerdos.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getCerdos)
router.get('/:id', getCerdo)
router.get('/:id/venta', getVentaCerdo)
router.get('/:id/mortalidad', getMortalidadCerdo)
router.get('/:id/traslados', getTrasladosCerdo)
router.get('/:id/alimentacion', getAlimentacionCerdo)
router.get('/:id/revisiones', getRevisionesCerdo)
router.get('/:id/pesajes', getPesajesCerdo)
router.post('/', registrarCerdo)
router.post('/:id/trasladar', trasladarCerdo)
router.post('/:id/muerte', registrarMuerte)
router.get('/:id/historial-peso', getHistorialPeso)

export default router
