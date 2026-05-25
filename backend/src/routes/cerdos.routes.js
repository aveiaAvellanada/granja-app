import { Router } from 'express'
import {
  getCerdos,
  getCerdo,
  registrarCerdo,
  trasladarCerdo,
  registrarMuerte,
  getHistorialPeso,
} from '../controllers/cerdos.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getCerdos)
router.get('/:id', getCerdo)
router.post('/', registrarCerdo)
router.post('/:id/trasladar', trasladarCerdo)
router.post('/:id/muerte', registrarMuerte)
router.get('/:id/historial-peso', getHistorialPeso)

export default router
