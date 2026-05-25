import { Router } from 'express'
import { getPesajes, registrarPesaje, getPendientes } from '../controllers/pesajes.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getPesajes)
router.post('/', registrarPesaje)
router.get('/pendientes', getPendientes)

export default router
