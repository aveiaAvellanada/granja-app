import { Router } from 'express'
import { getEmpleados, createEmpleado, updateEmpleado, getActividadEmpleado } from '../controllers/empleados.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getEmpleados)
router.post('/', createEmpleado)
router.put('/:id', updateEmpleado)
router.get('/:id/actividad', getActividadEmpleado)

export default router
