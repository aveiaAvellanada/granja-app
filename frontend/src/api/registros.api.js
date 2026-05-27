import api from './index.js'

export const getAlimentacion = () => api.get('/registros/alimentacion')
export const registrarAlimentacion = (data) => api.post('/registros/alimentacion', data)

export const getRevision = () => api.get('/registros/revision')
export const registrarRevision = (data) => api.post('/registros/revision', data)

export const getPesajes = () => api.get('/registros/pesajes')
export const registrarPesaje = (data) => api.post('/registros/pesajes', data)

export const getConsumoAlimento = (params) => api.get('/registros/consumo', { params })
