import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { login as loginApi } from '../api/auth.api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function onSubmit(data) {
    setLoading(true)
    setError('')
    try {
      const res = await loginApi(data)
      login(res.data.token, res.data.usuario)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={{ textAlign: 'center', marginTop: 0, fontSize: '1.4rem' }}>
          Granja La Voluntad de Dios
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={label}>Usuario</label>
            <input
              style={input}
              {...register('usuario', { required: 'Requerido' })}
              autoComplete="username"
            />
            {errors.usuario && <span style={err}>{errors.usuario.message}</span>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={label}>Contraseña</label>
            <input
              type="password"
              style={input}
              {...register('contrasena', { required: 'Requerido' })}
              autoComplete="current-password"
            />
            {errors.contrasena && <span style={err}>{errors.contrasena.message}</span>}
          </div>
          {error && <div style={{ ...err, marginBottom: '1rem', display: 'block' }}>{error}</div>}
          <button type="submit" disabled={loading} style={btn}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const container = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }
const card = { background: '#fff', padding: '2.5rem', borderRadius: 12, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }
const label = { display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.875rem' }
const input = { width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.95rem', boxSizing: 'border-box' }
const err = { color: '#ef4444', fontSize: '0.8rem' }
const btn = { width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: 6, fontWeight: 700, fontSize: '1rem' }
