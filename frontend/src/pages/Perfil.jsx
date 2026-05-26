import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { cambiarPassword } from '../api/auth.api'
import PageHeader from '../components/PageHeader'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField'
import Breadcrumb from '../components/Breadcrumb'
import { Icon } from '../components/Icon.jsx'

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

export default function Perfil() {
  const { user } = useAuth()
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [showPass, setShowPass] = useState({ a: false, n: false, c: false })

  const onSubmit = async (data) => {
    setLoading(true)
    setMessage({ text: '', type: '' })
    try {
      await cambiarPassword({
        contrasena_actual: data.contrasena_actual,
        contrasena_nueva: data.contrasena_nueva
      })
      setMessage({ text: 'Contraseña actualizada exitosamente', type: 'success' })
      reset()
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Error al actualizar', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Perfil', path: '/perfil' }
  ]

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Perfil de usuario" subtitle="Tu información personal y configuración de seguridad" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* ═══ Info Card ═══ */}
        <div style={card}>
          <div style={cardHead}>
            <h3 style={cardTitle}>Información personal</h3>
            <span className="badge badge-success" style={{ textTransform: 'none', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              <Icon name="check" size={11} /> Verificado
            </span>
          </div>

          <div style={avatarRow}>
            <div style={bigAvatar}>{initials(user?.nombre)}</div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
                {user?.nombre}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>
                {user?.rol}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            <Field icon="user" label="Nombre completo" value={user?.nombre} />
            <Field icon="badge" label="Rol del sistema" value={user?.rol} capitalize />
            <Field icon="shield" label="Sesión activa" value="Token JWT vigente" />
          </div>
        </div>

        {/* ═══ Change Password ═══ */}
        <div style={card}>
          <div style={cardHead}>
            <h3 style={cardTitle}>Seguridad de la cuenta</h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: '0.78rem', fontWeight: 500 }}>
              <Icon name="lock" size={13} /> Cifrado bcrypt
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <PassField
              label="Contraseña actual"
              show={showPass.a}
              onToggle={() => setShowPass({ ...showPass, a: !showPass.a })}
              register={register('contrasena_actual', { required: 'Requerido' })}
              error={errors.contrasena_actual?.message}
            />
            <PassField
              label="Nueva contraseña"
              hint="Mínimo 8 caracteres"
              show={showPass.n}
              onToggle={() => setShowPass({ ...showPass, n: !showPass.n })}
              register={register('contrasena_nueva', {
                required: 'Requerido',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' }
              })}
              error={errors.contrasena_nueva?.message}
            />
            <PassField
              label="Confirmar nueva contraseña"
              show={showPass.c}
              onToggle={() => setShowPass({ ...showPass, c: !showPass.c })}
              register={register('confirmar_password', {
                required: 'Requerido',
                validate: (val) => watch('contrasena_nueva') === val || 'Las contraseñas no coinciden'
              })}
              error={errors.confirmar_password?.message}
            />

            {message.text && (
              <div style={message.type === 'success' ? successBanner : errorBanner}>
                <Icon name={message.type === 'success' ? 'check' : 'alert'} size={15} />
                {message.text}
              </div>
            )}

            <button type="submit" style={{ ...btnPrimary, width: '100%', marginTop: 6 }} disabled={loading}>
              {loading ? 'Actualizando...' : <><Icon name="check" size={15} /> Actualizar contraseña</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ icon, label, value, capitalize }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-soft)' }}>
        <Icon name={icon} size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
        <div style={{ fontSize: '0.92rem', color: 'var(--ink)', fontWeight: 600, textTransform: capitalize ? 'capitalize' : 'none' }}>{value || '—'}</div>
      </div>
    </div>
  )
}

function PassField({ label, hint, show, onToggle, register, error }) {
  return (
    <FormField label={label} hint={hint} error={error}>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          style={{ ...inputStyle, paddingRight: 40 }}
          {...register}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 6, color: 'var(--ink-3)', borderRadius: 6,
          }}
          aria-label={show ? 'Ocultar' : 'Mostrar'}
        >
          <Icon name="eye" size={15} />
        </button>
      </div>
    </FormField>
  )
}

const cardHead = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border-soft)',
}

const cardTitle = {
  margin: 0, fontSize: '1.05rem',
  fontFamily: 'var(--font-display)',
  color: 'var(--ink)', fontWeight: 700,
}

const avatarRow = {
  display: 'flex', alignItems: 'center', gap: 16,
  padding: '14px 16px',
  background: 'linear-gradient(135deg, var(--green-soft) 0%, var(--surface-2) 100%)',
  borderRadius: 12,
  border: '1px solid var(--green-soft-2)',
  marginBottom: 16,
}

const bigAvatar = {
  width: 56, height: 56, borderRadius: 16,
  background: 'linear-gradient(135deg, var(--green) 0%, var(--green-hover) 100%)',
  color: '#FFFFFF',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1.1rem', fontWeight: 700,
  border: '2px solid var(--surface)',
  boxShadow: '0 0 0 1.5px var(--amber), 0 4px 12px rgba(22,101,52,0.2)',
  fontFamily: 'var(--font-display)',
}

const successBanner = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '10px 13px',
  borderRadius: 10,
  fontSize: '0.85rem',
  fontWeight: 600,
  background: 'var(--green-soft)',
  color: 'var(--green-ink)',
  border: '1px solid var(--green-soft-2)',
  marginBottom: 12,
}

const errorBanner = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '10px 13px',
  borderRadius: 10,
  fontSize: '0.85rem',
  fontWeight: 600,
  background: 'var(--rust-soft)',
  color: 'var(--rust-ink)',
  border: '1px solid var(--border-soft)',
  marginBottom: 12,
}
