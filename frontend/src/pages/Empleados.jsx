import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getEmpleados, createEmpleado, updateEmpleado } from '../api/empleados.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

export default function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState(null)
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

  async function handleToggle() {
    const e = confirmToggle
    const nuevoEstado = e.estado_empleado === 'Activo' ? 'Inactivo' : 'Activo'
    await updateEmpleado(e.id_empleado, { estado_empleado: nuevoEstado })
    setConfirmToggle(null)
    getEmpleados().then((r) => setEmpleados(r.data))
  }

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'id_empleado' },
    { header: 'Nombre', accessorKey: 'p_nombre', cell: info => `${info.getValue()} ${info.row.original.s_nombre ?? ''}`.trim() },
    { header: 'Apellido', accessorKey: 'p_apellido', cell: info => `${info.getValue()} ${info.row.original.s_apellido ?? ''}`.trim() },
    { header: 'Cédula', accessorKey: 'cedula_empleado' },
    { header: 'Correo', accessorKey: 'correo_empleado' },
    { 
      header: 'Estado', 
      accessorKey: 'estado_empleado',
      cell: info => {
        const estado = info.getValue();
        return (
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', background: estado === 'Activo' ? '#dcfce7' : '#f3f4f6', color: estado === 'Activo' ? '#166534' : '#6b7280' }}>
            {estado}
          </span>
        )
      }
    },
    {
      header: 'Acción',
      id: 'accion',
      cell: info => {
        const e = info.row.original;
        return (
          <button onClick={() => setConfirmToggle(e)} style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff' }}>
            {e.estado_empleado === 'Activo' ? 'Desactivar' : 'Activar'}
          </button>
        )
      }
    }
  ], [])

  return (
    <div>
      <PageHeader title="Empleados">
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Nuevo empleado</button>
      </PageHeader>

      <div style={card}>
        <DataTable data={empleados} columns={columns} />
      </div>

      {showModal && (
        <Modal title="Nuevo empleado" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Primer Nombre" error={errors.p_nombre?.message}><input style={inputStyle} {...register('p_nombre', { required: true })} /></FormField>
            <FormField label="Segundo Nombre (Opcional)"><input style={inputStyle} {...register('s_nombre')} /></FormField>
            <FormField label="Primer Apellido" error={errors.p_apellido?.message}><input style={inputStyle} {...register('p_apellido', { required: true })} /></FormField>
            <FormField label="Segundo Apellido (Opcional)"><input style={inputStyle} {...register('s_apellido')} /></FormField>
            <FormField label="Cédula" error={errors.cedula_empleado?.message}><input style={inputStyle} {...register('cedula_empleado', { required: true })} /></FormField>
            <FormField label="Correo electrónico" error={errors.correo_empleado?.message}><input style={inputStyle} type="email" {...register('correo_empleado', { required: true })} /></FormField>
            <FormField label="Contraseña" error={errors.contrasena?.message}><input style={inputStyle} type="password" {...register('contrasena', { required: true })} /></FormField>
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

      <ConfirmModal
        isOpen={!!confirmToggle}
        title={confirmToggle?.estado_empleado === 'Activo' ? 'Desactivar empleado' : 'Activar empleado'}
        message={
          confirmToggle?.estado_empleado === 'Activo'
            ? `¿Seguro que deseas desactivar a ${confirmToggle?.p_nombre} ${confirmToggle?.p_apellido}? El empleado perderá acceso al sistema.`
            : `¿Seguro que deseas activar a ${confirmToggle?.p_nombre} ${confirmToggle?.p_apellido}?`
        }
        confirmColor={confirmToggle?.estado_empleado === 'Activo' ? 'red' : 'blue'}
        onConfirm={handleToggle}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  )
}
