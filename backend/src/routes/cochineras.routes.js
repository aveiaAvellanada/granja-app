import { Router } from 'express'
import { getCochineras, createCochinera, updateCochinera } from '../controllers/cochineras.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getCochineras)
router.post('/', createCochinera)
router.put('/:id', updateCochinera)

export default router
