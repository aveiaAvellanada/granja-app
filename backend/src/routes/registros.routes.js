import { Router } from 'express'
import {
  getAlimentacion, registrarAlimentacion,
  getRevision, registrarRevision,
  getPesajes, registrarPesaje,
  getConsumoAlimento
} from '../controllers/registros.controller.js'

const router = Router()

router.get('/alimentacion', getAlimentacion)
router.post('/alimentacion', registrarAlimentacion)

router.get('/revision', getRevision)
router.post('/revision', registrarRevision)

router.get('/pesajes', getPesajes)
router.post('/pesajes', registrarPesaje)

router.get('/consumo', getConsumoAlimento)

export default router
