import { Router } from 'express'
import { getPendientes } from '../controllers/veterinario.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/pendientes', getPendientes)

export default router
