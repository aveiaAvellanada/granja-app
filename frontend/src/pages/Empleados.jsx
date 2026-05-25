import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getEmpleados, createEmpleado, updateEmpleado } from '../api/empleados.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'

export default function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [showModal, setShowModal] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getEmpleados().then((r) => setEmpleados(r.data)).catch(() => {})
  }, [])

  async function onSubmit(data) {
    await createEmpleado(data)
    reset()
    setShowModal(false)
    getEmpleados().then((r) => setEmpleados(r.data))
  }

  async function toggleEstado(e) {
    const nuevoEstado = e.estado === 'activo' ? 'inactivo' : 'activo'
    await updateEmpleado(e.id_empleado, { estado: nuevoEstado })
    getEmpleados().then((r) => setEmpleados(r.data))
  }

  return (
    <div>
      <PageHeader title="Empleados">
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Nuevo empleado</button>
      </PageHeader>

      <div style={card}>
        <table>
          <thead>
            <tr><th>Nombre</th><th>Cargo</th><th>Usuario</th><th>Teléfono</th><th>Estado</th><th>Acción</th></tr>
          </thead>
          <tbody>
            {empleados.map((e) => (
              <tr key={e.id_empleado}>
                <td>{e.nombre}</td>
                <td>{e.cargo}</td>
                <td>{e.usuario}</td>
                <td>{e.telefono ?? '—'}</td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', background: e.estado === 'activo' ? '#dcfce7' : '#f3f4f6', color: e.estado === 'activo' ? '#166534' : '#6b7280' }}>
                    {e.estado}
                  </span>
                </td>
                <td>
                  <button onClick={() => toggleEstado(e)} style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff' }}>
                    {e.estado === 'activo' ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Nuevo empleado" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Nombre" error={errors.nombre?.message}><input style={inputStyle} {...register('nombre', { required: true })} /></FormField>
            <FormField label="Cargo"><input style={inputStyle} {...register('cargo')} /></FormField>
            <FormField label="Usuario" error={errors.usuario?.message}><input style={inputStyle} {...register('usuario', { required: true })} /></FormField>
            <FormField label="Contraseña" error={errors.contrasena?.message}><input type="password" style={inputStyle} {...register('contrasena', { required: true })} /></FormField>
            <FormField label="Teléfono"><input style={inputStyle} {...register('telefono')} /></FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Crear empleado</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
