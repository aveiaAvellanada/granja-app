import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { login as loginApi } from '../api/auth.api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Icon } from '../components/Icon.jsx'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
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
    <div style={page}>
      {/* ════ LEFT — Brand panel ════════════════════════════ */}
      <div style={leftPanel}>
        {/* decorative blobs */}
        <div style={blobA} />
        <div style={blobB} />
        <div style={gridPattern} />

        <div style={leftTop}>
          <div style={brandMark}>
            <Icon name="leaf" size={20} color="var(--amber)" />
          </div>
          <div>
            <div style={{ color: 'var(--ink-on-dark)', fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.005em' }}>La Voluntad de Dios</div>
            <div style={{ color: 'var(--ink-on-dark-3)', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2, fontWeight: 600 }}>
              Granja Porcina · 2026
            </div>
          </div>
        </div>

        <div style={leftCenter}>
          <div style={eyebrowTag}>
            <span className="status-dot green pulse-dot" />
            Sistema integral de gestión
          </div>
          <h1 style={brandTitle}>
            Producción<br />
            <em style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--ink-on-dark-2)' }}>con propósito.</em>
          </h1>
          <p style={brandLead}>
            Control completo de tu operación porcina — cerdos,
            cochineras, salud, alimentación, inventario y ventas
            en una sola plataforma.
          </p>

          <div style={statRow}>
            <Stat n="9" label="Módulos integrados" />
            <Sep />
            <Stat n="24/7" label="Auditoría completa" />
            <Sep />
            <Stat n="100%" label="Datos en la nube" />
          </div>
        </div>

        <div style={leftFooter}>
          © 2026 · Granja La Voluntad de Dios · Todos los derechos reservados
        </div>
      </div>

      {/* ════ RIGHT — Form panel ════════════════════════════ */}
      <div style={rightPanel}>
        <div style={formCard}>
          <div style={formHead}>
            <h2 style={formTitle}>Bienvenido de vuelta</h2>
            <p style={formSub}>Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={fieldGroup}>
              <label style={lbl}>Usuario</label>
              <div style={{ position: 'relative' }}>
                <span style={inputIcon}><Icon name="user" size={16} /></span>
                <input
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  {...register('usuario', { required: 'Campo requerido' })}
                  autoComplete="username"
                  placeholder="Correo o nombre de usuario"
                />
              </div>
              {errors.usuario && <span style={errStyle}>{errors.usuario.message}</span>}
            </div>

            <div style={fieldGroup}>
              <label style={lbl}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <span style={inputIcon}><Icon name="lock" size={16} /></span>
                <input
                  type={showPass ? 'text' : 'password'}
                  style={{ ...inputStyle, paddingLeft: 40, paddingRight: 40 }}
                  {...register('contrasena', { required: 'Campo requerido' })}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={eyeBtn}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <Icon name="eye" size={16} />
                </button>
              </div>
              {errors.contrasena && <span style={errStyle}>{errors.contrasena.message}</span>}
            </div>

            {error && (
              <div style={errorBanner}>
                <Icon name="alert" size={16} />
                <span><strong>Error: </strong>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? (
                <>
                  <span style={spinner} /> Verificando...
                </>
              ) : (
                <>
                  Iniciar sesión <Icon name="arrow-right" size={16} />
                </>
              )}
            </button>
          </form>

          <div style={helpFoot}>
            <Icon name="shield" size={13} />
            <span>Conexión cifrada · JWT · bcrypt</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ n, label }) {
  return (
    <div>
      <div style={{ color: 'var(--ink-on-dark)', fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{n}</div>
      <div style={{ color: 'var(--ink-on-dark-3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  )
}
function Sep() { return <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} /> }

/* ── Styles ─────────────────────────────────────────────────── */

const page = {
  minHeight: '100vh',
  display: 'flex',
  background: 'var(--canvas)',
  fontFamily: 'var(--font-body)',
}

const leftPanel = {
  width: '46%',
  background: 'linear-gradient(160deg, var(--forest) 0%, var(--forest-mid) 60%, var(--forest-elevated) 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '2.5rem 3.5rem',
  position: 'relative',
  overflow: 'hidden',
  color: 'var(--ink-on-dark)',
}

const gridPattern = {
  position: 'absolute', inset: 0,
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
  `,
  backgroundSize: '40px 40px',
  pointerEvents: 'none',
}

const blobA = {
  position: 'absolute',
  top: '-15%', right: '-10%',
  width: 480, height: 480,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(161,98,7,0.18) 0%, rgba(161,98,7,0) 70%)',
  filter: 'blur(40px)',
  pointerEvents: 'none',
}

const blobB = {
  position: 'absolute',
  bottom: '-20%', left: '-10%',
  width: 460, height: 460,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(46,125,50,0.22) 0%, rgba(46,125,50,0) 70%)',
  filter: 'blur(40px)',
  pointerEvents: 'none',
}

const leftTop = {
  display: 'flex', alignItems: 'center', gap: 12,
  position: 'relative', zIndex: 2,
}

const brandMark = {
  width: 42, height: 42,
  borderRadius: 12,
  background: 'rgba(161,98,7,0.15)',
  border: '1px solid rgba(161,98,7,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const leftCenter = {
  position: 'relative', zIndex: 2,
  maxWidth: 460,
}

const eyebrowTag = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '5px 12px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'var(--ink-on-dark-2)',
  fontSize: '0.74rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  marginBottom: 28,
}

const brandTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
  fontWeight: 700,
  color: 'var(--ink-on-dark)',
  lineHeight: 1.05,
  margin: '0 0 1.5rem',
  letterSpacing: '-0.025em',
}

const brandLead = {
  color: 'var(--ink-on-dark-2)',
  fontSize: '1rem',
  lineHeight: 1.65,
  margin: '0 0 2.5rem',
  maxWidth: 420,
}

const statRow = {
  display: 'flex', alignItems: 'center', gap: 20,
  paddingTop: 24,
  borderTop: '1px solid rgba(255,255,255,0.08)',
}

const leftFooter = {
  position: 'relative', zIndex: 2,
  color: 'var(--ink-on-dark-3)',
  fontSize: '0.74rem',
  letterSpacing: '0.04em',
}

const rightPanel = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  position: 'relative',
}

const formCard = {
  background: 'var(--surface)',
  borderRadius: 20,
  padding: '2.75rem 2.5rem 2rem',
  width: '100%',
  maxWidth: 440,
  boxShadow: 'var(--shadow-lg)',
  border: '1px solid var(--border-soft)',
}

const formHead = {
  marginBottom: '1.75rem',
}

const formTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.65rem',
  fontWeight: 700,
  color: 'var(--ink)',
  margin: '0 0 6px',
  letterSpacing: '-0.015em',
}

const formSub = {
  color: 'var(--ink-3)',
  fontSize: '0.9rem',
  margin: 0,
}

const fieldGroup = { marginBottom: '1.1rem' }

const lbl = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
  color: 'var(--ink-2)',
  marginBottom: 7,
}

const inputStyle = {
  width: '100%',
  padding: '11px 13px',
  border: '1.5px solid var(--border)',
  borderRadius: 10,
  fontSize: '0.92rem',
  color: 'var(--ink)',
  background: 'var(--surface-2)',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'all 120ms ease',
}

const inputIcon = {
  position: 'absolute',
  left: 13, top: '50%', transform: 'translateY(-50%)',
  color: 'var(--ink-3)',
  pointerEvents: 'none',
}

const eyeBtn = {
  position: 'absolute',
  right: 8, top: '50%', transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 6,
  borderRadius: 6,
  color: 'var(--ink-3)',
}

const errStyle = {
  display: 'block',
  color: 'var(--rust)',
  fontSize: '0.76rem',
  marginTop: 6,
  fontWeight: 600,
}

const errorBanner = {
  display: 'flex', alignItems: 'center', gap: 10,
  background: 'var(--rust-soft)',
  color: 'var(--rust-ink)',
  border: '1px solid var(--border-soft)',
  borderRadius: 10,
  padding: '10px 13px',
  fontSize: '0.86rem',
  margin: '0 0 1rem',
}

const submitBtn = {
  width: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  background: 'linear-gradient(180deg, var(--green) 0%, var(--green-hover) 100%)',
  color: '#FFFFFF',
  border: 'none',
  padding: '13px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: '0.94rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  letterSpacing: '0.01em',
  marginTop: 6,
  boxShadow: '0 4px 12px rgba(22,101,52,0.25)',
  transition: 'transform 120ms ease, box-shadow 120ms ease',
}

const helpFoot = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  color: 'var(--ink-3)',
  fontSize: '0.76rem',
  marginTop: 24,
  paddingTop: 18,
  borderTop: '1px solid var(--border-soft)',
}

const spinner = {
  width: 14, height: 14,
  border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: '#FFFFFF',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  display: 'inline-block',
}
