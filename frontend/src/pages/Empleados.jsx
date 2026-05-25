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
    const nuevoEstado = e.estado_empleado === 'Activo' ? 'Inactivo' : 'Activo'
    await updateEmpleado(e.id_empleado, { estado_empleado: nuevoEstado })
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
            <tr><th>ID</th><th>Nombre</th><th>Apellido</th><th>Cédula</th><th>Estado</th><th>Acción</th></tr>
          </thead>
          <tbody>
            {empleados.map((e) => (
              <tr key={e.id_empleado}>
                <td>{e.id_empleado}</td>
                <td>{e.p_nombre} {e.s_nombre ?? ''}</td>
                <td>{e.p_apellido} {e.s_apellido ?? ''}</td>
                <td>{e.cedula_empleado}</td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', background: e.estado_empleado === 'Activo' ? '#dcfce7' : '#f3f4f6', color: e.estado_empleado === 'Activo' ? '#166534' : '#6b7280' }}>
                    {e.estado_empleado}
                  </span>
                </td>
                <td>
                  <button onClick={() => toggleEstado(e)} style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff' }}>
                    {e.estado_empleado === 'Activo' ? 'Desactivar' : 'Activar'}
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
            <FormField label="Primer Nombre" error={errors.p_nombre?.message}><input style={inputStyle} {...register('p_nombre', { required: true })} /></FormField>
            <FormField label="Segundo Nombre (Opcional)"><input style={inputStyle} {...register('s_nombre')} /></FormField>
            <FormField label="Primer Apellido" error={errors.p_apellido?.message}><input style={inputStyle} {...register('p_apellido', { required: true })} /></FormField>
            <FormField label="Segundo Apellido (Opcional)"><input style={inputStyle} {...register('s_apellido')} /></FormField>
            <FormField label="Cédula" error={errors.cedula_empleado?.message}><input style={inputStyle} {...register('cedula_empleado', { required: true })} /></FormField>
            <FormField label="Estado" error={errors.estado_empleado?.message}>
              <select style={inputStyle} {...register('estado_empleado', { required: true })}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Crear empleado</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
