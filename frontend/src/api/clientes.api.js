import api from './index.js'

export const buscarClientes = (cedula) => api.get('/clientes/buscar', { params: { cedula } })
export const getClientes = () => api.get('/clientes')
export const createCliente = (data) => api.post('/clientes', data)
export const updateCliente = (id, data) => api.put(`/clientes/${id}`, data)
