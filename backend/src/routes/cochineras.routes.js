import { Router } from 'express'
import { getCochineras, createCochinera, updateCochinera, getCochineraCerdos } from '../controllers/cochineras.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getCochineras)
router.get('/:id/cerdos', getCochineraCerdos)
router.post('/', createCochinera)
router.put('/:id', updateCochinera)

export default router
