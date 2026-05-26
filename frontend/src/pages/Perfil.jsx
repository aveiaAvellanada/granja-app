import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { cambiarPassword } from '../api/auth.api'
import PageHeader from '../components/PageHeader'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField'
import Breadcrumb from '../components/Breadcrumb'

export default function Perfil() {
  const { user } = useAuth()
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

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
      <PageHeader title="Perfil de Usuario" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Info Card */}
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Información Personal</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>Nombre Completo</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{user?.nombre}</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>Rol del Sistema</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{user?.rol}</p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Seguridad</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Contraseña actual" error={errors.contrasena_actual?.message}>
              <input 
                type="password" 
                style={inputStyle} 
                {...register('contrasena_actual', { required: 'Requerido' })} 
              />
            </FormField>

            <FormField label="Nueva contraseña (min 8 caracteres)" error={errors.contrasena_nueva?.message}>
              <input 
                type="password" 
                style={inputStyle} 
                {...register('contrasena_nueva', { 
                  required: 'Requerido',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                })} 
              />
            </FormField>

            <FormField label="Confirmar nueva contraseña" error={errors.confirmar_password?.message}>
              <input 
                type="password" 
                style={inputStyle} 
                {...register('confirmar_password', { 
                  required: 'Requerido',
                  validate: (val) => {
                    if (watch('contrasena_nueva') !== val) {
                      return 'Las contraseñas no coinciden';
                    }
                  }
                })} 
              />
            </FormField>

            {message.text && (
              <p style={{ 
                padding: '0.5rem', 
                borderRadius: '4px', 
                fontSize: '0.85rem',
                background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#166534' : '#991b1b',
                marginBottom: '1rem'
              }}>
                {message.text}
              </p>
            )}

            <button type="submit" style={{ ...btnPrimary, width: '100%' }} disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
