import api from './index.js'

export const getResumen = () => api.get('/dashboard/resumen')
export const getAlertas = () => api.get('/dashboard/alertas')
export const getVentasAnio = (anio) => api.get(`/dashboard/ventas/${anio}`)
export const getCochineras = () => api.get('/dashboard/cochineras')
