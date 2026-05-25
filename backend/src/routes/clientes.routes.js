import { Router } from 'express'
import { getClientes, createCliente, updateCliente, searchClientes } from '../controllers/clientes.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/buscar', searchClientes)
router.get('/', getClientes)
router.post('/', createCliente)
router.put('/:id', updateCliente)

export default router