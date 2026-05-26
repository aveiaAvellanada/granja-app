import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getClientes, createCliente, updateCliente } from '../api/clientes.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ExportButton from '../components/ExportButton'
import ConfirmModal from '../components/ConfirmModal.jsx'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const reloadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getClientes()
      setClientes(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reloadData()
  }, [])

  async function onSubmit(data) {
    try {
      await createCliente(data)
      reset()
      setShowModal(false)
      reloadData()
    } catch (err) {}
  }

  async function handleToggle() {
    const c = confirmToggle
    const nuevoEstado = c.estado_cliente === 'Activo' ? 'Inactivo' : 'Activo'
    await updateCliente(c.id_cliente, { estado_cliente: nuevoEstado })
    setConfirmToggle(null)
    reloadData()
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
        const isActivo = estado === 'Activo';
        return (
          <span className={`badge ${isActivo ? 'badge-success' : 'badge-mono'}`}>
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
          <button onClick={() => setConfirmToggle(c)} style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff' }}>
            {c.estado_cliente === 'Activo' ? 'Desactivar' : 'Activar'}
          </button>
        )
      }
    }
  ], [])

  return (
    <div>
      <PageHeader title="Clientes">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ExportButton data={clientes} filename="Clientes" />
          <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Registrar cliente</button>
        </div>
      </PageHeader>

      {loading ? (
        <LoadingSpinner message="Cargando clientes..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reloadData} />
      ) : (
        <div style={card}>
          <DataTable data={clientes} columns={columns} />
        </div>
      )}

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

      <ConfirmModal
        isOpen={!!confirmToggle}
        title={confirmToggle?.estado_cliente === 'Activo' ? 'Desactivar cliente' : 'Activar cliente'}
        message={
          confirmToggle?.estado_cliente === 'Activo'
            ? ("¿Seguro que deseas desactivar a " + confirmToggle?.p_nombre + " " + confirmToggle?.p_apellido + "? No podrá ser seleccionado en nuevas ventas.")
            : ("¿Seguro que deseas activar a " + confirmToggle?.p_nombre + " " + confirmToggle?.p_apellido + "?")
        }
        confirmColor={confirmToggle?.estado_cliente === 'Activo' ? 'red' : 'blue'}
        onConfirm={handleToggle}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  )
}
