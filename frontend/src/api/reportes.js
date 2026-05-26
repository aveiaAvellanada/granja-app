import api from './index.js'

export const getReportesMensuales = () => api.get('/reportes/mensuales')
export const generarReporteMes = (data) => api.post('/reportes/mensuales/generar', data)
export const getAuditoriaEventos = (params) => api.get('/reportes/auditoria', { params })
export const getAppLogs = (params) => api.get('/reportes/logs', { params })
export const getDashboardCache = () => api.get('/reportes/cache')
