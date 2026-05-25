import api from './index.js'

export const getPesajes = () => api.get('/pesajes')
export const registrarPesaje = (data) => api.post('/pesajes', data)
export const getPendientes = () => api.get('/pesajes/pendientes')
