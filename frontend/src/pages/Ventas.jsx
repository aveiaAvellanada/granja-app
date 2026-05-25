import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getVentas, registrarVenta, anularFactura } from '../api/ventas.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, btnDanger, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, reset } = useForm()

  const reload = () => {
    getVentas().then((r) => setVentas(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }

  useEffect(reload, [])

  async function onSubmit(data) {
    try {
      const ids = data.ids_cerdos.split(',').map((s) => parseInt(s.trim()))
      const precios = data.precios.split(',').map((s) => parseFloat(s.trim()))
      await registrarVenta({ ...data, ids_cerdos: ids, precios })
      reset()
      setShowModal(false)
      reload()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar venta')
    }
  }

  async function handleAnular(id) {
    if (!confirm('¿Anular esta factura?')) return
    await anularFactura(id)
    reload()
  }

  const columns = useMemo(() => [
    { header: 'Factura', accessorKey: 'id_factura', cell: info => `#${info.getValue()}` },
    { header: 'Cliente', accessorFn: row => row.cliente ?? row.id_cliente },
    { header: 'Empleado', accessorFn: row => row.empleado ?? row.id_empleado },
    { header: 'Total', accessorFn: row => row.total ?? row.valor_total, cell: info => <span style={{ fontWeight: 700 }}>${info.getValue() ?? '—'}</span> },
    { header: 'Fecha', accessorKey: 'fecha_venta', cell: info => info.getValue()?.slice(0, 10) },
    { 
      header: 'Estado', 
      accessorKey: 'estado_factura',
      cell: info => {
        const estado = info.getValue() ?? 'Activa';
        return (
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', background: estado === 'Anulada' ? '#fee2e2' : '#dcfce7', color: estado === 'Anulada' ? '#991b1b' : '#166534' }}>
            {estado}
          </span>
        )
      }
    },
    {
      header: 'Acción',
      id: 'accion',
      cell: info => {
        const v = info.row.original;
        if (v.estado_factura === 'Anulada') return null;
        return (
          <button onClick={() => handleAnular(v.id_factura)} style={{ ...btnDanger, fontSize: '0.78rem', padding: '3px 8px' }}>
            Anular
          </button>
        )
      }
    }
  ], [])

  return (
    <div>
      <PageHeader title="Ventas">
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Nueva venta</button>
      </PageHeader>

      <div style={card}>
        <DataTable data={ventas} columns={columns} />
      </div>

      {showModal && (
        <Modal title="Nueva venta" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="ID Cliente"><input style={inputStyle} type="number" {...register('id_cliente', { required: true })} /></FormField>
            <FormField label="ID Empleado"><input style={inputStyle} type="number" {...register('id_empleado', { required: true })} /></FormField>
            <FormField label="IDs de cerdos (separados por coma)">
              <input style={inputStyle} placeholder="ej: 1,2,3" {...register('ids_cerdos', { required: true })} />
            </FormField>
            <FormField label="Precios (uno por cerdo, separados por coma)">
              <input style={inputStyle} placeholder="ej: 500000,550000" {...register('precios', { required: true })} />
            </FormField>
            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Registrar venta</button>
          </form>
        </Modal>
      )}
    </div>
  )
}