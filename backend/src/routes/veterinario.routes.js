import { Router } from 'express'
import { getPendientes, registrarRevision, getHistorialCerdo } from '../controllers/veterinario.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/pendientes', getPendientes)
router.post('/revision', registrarRevision)
router.get('/:id_cerdo', getHistorialCerdo)

export default router
