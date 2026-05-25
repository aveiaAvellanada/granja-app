import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getClientes, createCliente, updateCliente } from '../api/clientes.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getClientes().then((r) => setClientes(r.data)).catch(() => {})
  }, [])

  async function onSubmit(data) {
    await createCliente(data)
    reset()
    setShowModal(false)
    getClientes().then((r) => setClientes(r.data))
  }

  async function toggleEstado(c) {
    const nuevoEstado = c.estado_cliente === 'Activo' ? 'Inactivo' : 'Activo'
    await updateCliente(c.id_cliente, { estado_cliente: nuevoEstado })
    getClientes().then((r) => setClientes(r.data))
  }

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'id_cliente' },
    { header: 'Nombre Completo', accessorFn: row => `${row.p_nombre} ${row.s_nombre ?? ''} ${row.p_apellido} ${row.s_apellido ?? ''}`.replace(/\s+/g, ' ').trim() },
    { header: 'Cédula', accessorKey: 'cedula_cliente' },
    { header: 'Teléfono', accessorKey: 'telefono', cell: info => info.getValue() ?? '—' },
    { header: 'Correo', accessorKey: 'correo_cliente', cell: info => info.getValue() ?? '—' },
    { 
      header: 'Estado', 
      accessorKey: 'estado_cliente',
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
      header: 'Acciones',
      id: 'acciones',
      cell: info => {
        const c = info.row.original;
        return (
          <button onClick={() => toggleEstado(c)} style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff' }}>
            {c.estado_cliente === 'Activo' ? 'Desactivar' : 'Activar'}
          </button>
        )
      }
    }
  ], [])

  return (
    <div>
      <PageHeader title="Clientes">
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Registrar cliente</button>
      </PageHeader>

      <div style={card}>
        <DataTable data={clientes} columns={columns} />
      </div>

      {showModal && (
        <Modal title="Nuevo cliente" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Primer Nombre" error={errors.p_nombre?.message}><input style={inputStyle} {...register('p_nombre', { required: true })} /></FormField>
            <FormField label="Segundo Nombre (Opcional)"><input style={inputStyle} {...register('s_nombre')} /></FormField>
            <FormField label="Primer Apellido" error={errors.p_apellido?.message}><input style={inputStyle} {...register('p_apellido', { required: true })} /></FormField>
            <FormField label="Segundo Apellido (Opcional)"><input style={inputStyle} {...register('s_apellido')} /></FormField>
            <FormField label="Cédula" error={errors.cedula_cliente?.message}><input style={inputStyle} {...register('cedula_cliente', { required: true })} /></FormField>
            <FormField label="Teléfono (Opcional)"><input style={inputStyle} {...register('telefono')} /></FormField>
            <FormField label="Correo (Opcional)"><input style={inputStyle} type="email" {...register('correo_cliente')} /></FormField>
            <FormField label="Estado" error={errors.estado_cliente?.message}>
              <select style={inputStyle} {...register('estado_cliente', { required: true })}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Crear cliente</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
