import api from './index.js'

export const getVentas = (params) => api.get('/ventas', { params })
export const registrarVenta = (data) => api.post('/ventas', data)
export const anularFactura = (id) => api.put(`/ventas/${id}/anular`)
export const getDashboardVentas = (anio) => api.get(`/ventas/dashboard/${anio}`)
export const getDetalleVenta = (id) => api.get(`/ventas/${id}/detalle`)
