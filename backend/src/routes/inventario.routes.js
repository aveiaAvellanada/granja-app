import { Router } from 'express'
import { getInventario, getAlertas, createItem, updateStock, getUnidades } from '../controllers/inventario.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getInventario)
router.get('/unidades', getUnidades)
router.get('/alertas', getAlertas)
router.post('/', createItem)
router.put('/:id', updateStock)

export default router
