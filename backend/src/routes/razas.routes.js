import { Router } from 'express'
import { getRazas } from '../controllers/razas.controller.js'

const router = Router()

router.get('/', getRazas)

export default router
