import api from './index.js'

export const getCerdos = () => api.get('/cerdos')
export const getCerdo = (id) => api.get(`/cerdos/${id}`)
export const registrarCerdo = (data) => api.post('/cerdos', data)
export const trasladarCerdo = (id, data) => api.post(`/cerdos/${id}/trasladar`, data)
export const registrarMuerte = (id, data) => api.post(`/cerdos/${id}/muerte`, data)
export const getHistorialPeso = (id) => api.get(`/cerdos/${id}/historial-peso`)
export const getVentaCerdo = (id) => api.get(`/cerdos/${id}/venta`)
export const getMortalidadCerdo = (id) => api.get(`/cerdos/${id}/mortalidad`)
export const getTrasladosCerdo = (id) => api.get(`/cerdos/${id}/traslados`)
export const getAlimentacionCerdo = (id) => api.get(`/cerdos/${id}/alimentacion`)
export const getRevisionesCerdo = (id) => api.get(`/cerdos/${id}/revisiones`)
export const getPesajesCerdo = (id) => api.get(`/cerdos/${id}/pesajes`)
