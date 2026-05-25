import api from './index.js'

export const getInventario = () => api.get('/inventario')
export const getAlertas = (umbral) => api.get('/inventario/alertas', { params: { umbral } })
export const createItem = (data) => api.post('/inventario', data)
export const updateStock = (id, data) => api.put(`/inventario/${id}`, data)
