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
      setError(err.response?.data?.error || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={pageStyle}>
      {/* Left panel */}
      <div style={leftPanel}>
        <div style={leftContent}>
          <div style={brandMarkStyle}>✦</div>
          <h1 style={brandTitleStyle}>La Voluntad<br /><em style={{ fontStyle: 'italic', fontWeight: 400 }}>de Dios</em></h1>
          <p style={brandSubStyle}>Sistema integral de gestión porcina</p>
          <div style={decorativeLine} />
          <p style={descStyle}>
            Control de producción, inventario, salud animal,
            ventas y reportes — todo en un solo lugar.
          </p>
        </div>
        <div style={footerTextStyle}>Granja La Voluntad de Dios © 2026</div>
      </div>

      {/* Right panel */}
      <div style={rightPanel}>
        <div style={formCardStyle}>
          <h2 style={formTitleStyle}>Iniciar sesión</h2>
          <p style={formSubStyle}>Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={fieldGroup}>
              <label style={labelStyle}>Usuario</label>
              <input
                style={inputStyle}
                {...register('usuario', { required: 'Campo requerido' })}
                autoComplete="username"
                placeholder="Tu correo o usuario"
              />
              {errors.usuario && <span style={errStyle}>{errors.usuario.message}</span>}
            </div>

            <div style={fieldGroup}>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                style={inputStyle}
                {...register('contrasena', { required: 'Campo requerido' })}
                autoComplete="current-password"
                placeholder="••••••••"
              />
              {errors.contrasena && <span style={errStyle}>{errors.contrasena.message}</span>}
            </div>

            {error && (
              <div style={errorBanner}>
                <span style={{ fontWeight: 600 }}>Error:</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ── Styles ── */

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  background: '#F4EFE6',
}

const leftPanel = {
  width: '42%',
  background: '#1A2E1A',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '3.5rem',
  position: 'relative',
  overflow: 'hidden',
}

const leftContent = {
  position: 'relative',
  zIndex: 1,
}

const brandMarkStyle = {
  color: '#C97A1A',
  fontSize: '2rem',
  marginBottom: '1.5rem',
  display: 'block',
}

const brandTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: '3rem',
  fontWeight: 900,
  color: '#F4EFE6',
  lineHeight: 1.15,
  margin: '0 0 1rem',
  letterSpacing: '-0.02em',
}

const brandSubStyle = {
  color: '#7A9870',
  fontSize: '0.9rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: '0 0 1.5rem',
}

const decorativeLine = {
  width: 48,
  height: 3,
  background: '#C97A1A',
  borderRadius: 2,
  marginBottom: '1.5rem',
}

const descStyle = {
  color: '#A8B8A8',
  fontSize: '0.95rem',
  lineHeight: 1.7,
  maxWidth: 320,
}

const footerTextStyle = {
  color: '#4A6545',
  fontSize: '0.75rem',
  letterSpacing: '0.05em',
}

const rightPanel = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
}

const formCardStyle = {
  background: '#FFFFFF',
  borderRadius: 16,
  padding: '2.5rem',
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 4px 24px rgba(26,46,26,0.1), 0 0 0 1px rgba(26,46,26,0.06)',
  border: '1px solid #EDE8DF',
}

const formTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#1A1A14',
  margin: '0 0 0.3rem',
}

const formSubStyle = {
  color: '#9A9282',
  fontSize: '0.875rem',
  margin: '0 0 1.75rem',
}

const fieldGroup = {
  marginBottom: '1.1rem',
}

const labelStyle = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#5C5845',
  marginBottom: '0.4rem',
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  border: '1.5px solid #DDD5C8',
  borderRadius: 8,
  fontSize: '0.9rem',
  color: '#1A1A14',
  background: '#FAFAF7',
  boxSizing: 'border-box',
  fontFamily: "'Cabin', system-ui, sans-serif",
  transition: 'border-color 0.15s',
}

const errStyle = {
  display: 'block',
  color: '#B5341F',
  fontSize: '0.78rem',
  marginTop: '0.3rem',
  fontWeight: 500,
}

const errorBanner = {
  background: '#FEE8E4',
  color: '#B5341F',
  border: '1px solid #F5C5BD',
  borderRadius: 8,
  padding: '0.65rem 0.9rem',
  fontSize: '0.875rem',
  marginBottom: '1rem',
}

const submitBtn = {
  width: '100%',
  background: '#4A7C35',
  color: '#FFFFFF',
  border: 'none',
  padding: '0.75rem',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: '0.95rem',
  cursor: 'pointer',
  fontFamily: "'Cabin', system-ui, sans-serif",
  letterSpacing: '0.03em',
  marginTop: '0.5rem',
  transition: 'background 0.15s',
}
