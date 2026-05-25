import api from './index.js'

export const getPendientes = () => api.get('/veterinario/pendientes')
export const registrarRevision = (data) => api.post('/veterinario/revision', data)
export const getHistorialCerdo = (id_cerdo) => api.get(`/veterinario/${id_cerdo}`)
