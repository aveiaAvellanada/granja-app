import api from './index.js'

export const login = (data) => api.post('/auth/login', data)
export const logout = () => api.post('/auth/logout')
export const me = () => api.get('/auth/me')
export const cambiarPassword = (data) => api.put('/auth/cambiar-password', data)
