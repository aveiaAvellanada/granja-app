import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getVentas, registrarVenta, anularFactura, getDetalleVenta } from '../api/ventas.api.js'
import { getClientes } from '../api/clientes.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, btnDanger, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [detalleModal, setDetalleModal] = useState(null)
  const [detalleInfo, setDetalleInfo] = useState([])
  const [error, setError] = useState('')
  const { register, handleSubmit, reset } = useForm()

  const reload = () => {
    getVentas().then((r) => setVentas(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }

  useEffect(() => {
    reload()
    getClientes().then((r) => setClientes(r.data.filter(c => c.estado_cliente === 'Activo'))).catch(() => {})
  }, [])

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

  async function handleVerDetalle(id) {
    try {
      const r = await getDetalleVenta(id)
      setDetalleInfo(r.data)
      setDetalleModal(id)
    } catch (err) {
      console.error(err)
    }
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
        return (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => handleVerDetalle(v.id_factura)} style={{ ...btnPrimary, fontSize: '0.78rem', padding: '3px 8px' }}>
              Ver Detalle
            </button>
            {v.estado_factura !== 'Anulada' && (
              <button onClick={() => handleAnular(v.id_factura)} style={{ ...btnDanger, fontSize: '0.78rem', padding: '3px 8px' }}>
                Anular
              </button>
            )}
          </div>
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
            <FormField label="Cliente">
              <select style={inputStyle} {...register('id_cliente', { required: true })}>
                <option value="">Seleccione cliente...</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.p_nombre} {c.p_apellido}</option>
                ))}
              </select>
            </FormField>
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

      {detalleModal && (
        <Modal title={`Detalle Factura #${detalleModal}`} onClose={() => setDetalleModal(null)}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '0.5rem' }}>ID Cerdo</th>
                <th style={{ padding: '0.5rem' }}>Sexo</th>
                <th style={{ padding: '0.5rem' }}>Raza</th>
                <th style={{ padding: '0.5rem' }}>Precio Venta</th>
              </tr>
            </thead>
            <tbody>
              {detalleInfo.map((d, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem' }}>#{d.id_cerdo}</td>
                  <td style={{ padding: '0.5rem' }}>{d.sexo_cerdo}</td>
                  <td style={{ padding: '0.5rem' }}>{d.raza}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>${d.precio_venta_cop}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {detalleInfo.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '1rem' }}>No hay detalles.</p>}
        </Modal>
      )}
    </div>
  )
}