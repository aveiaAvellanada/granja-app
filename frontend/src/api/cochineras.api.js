import api from './index.js'

export const getCochineras = () => api.get('/cochineras')
export const getCochineraCerdos = (id) => api.get(`/cochineras/${id}/cerdos`)
export const createCochinera = (data) => api.post('/cochineras', data)
export const updateCochinera = (id, data) => api.put(`/cochineras/${id}`, data)
