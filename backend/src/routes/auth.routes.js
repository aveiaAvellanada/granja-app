import { Router } from 'express'
import { login, me, logout, cambiarPassword } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/login', login)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, me)
router.put('/cambiar-password', authMiddleware, cambiarPassword)

export default router
