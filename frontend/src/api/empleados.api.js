import api from './index.js'

export const getEmpleados = () => api.get('/empleados')
export const createEmpleado = (data) => api.post('/empleados', data)
export const updateEmpleado = (id, data) => api.put(`/empleados/${id}`, data)
export const getActividadEmpleado = (id, params) => api.get(`/empleados/${id}/actividad`, { params })
