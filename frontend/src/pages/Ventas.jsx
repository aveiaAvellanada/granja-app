import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getVentas, registrarVenta, anularFactura } from '../api/ventas.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, btnDanger, card } from '../components/FormField.jsx'

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

  return (
    <div>
      <PageHeader title="Ventas">
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Nueva venta</button>
      </PageHeader>

      <div style={card}>
        <table>
          <thead>
            <tr><th>Factura</th><th>Cliente</th><th>Empleado</th><th>Total</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr>
          </thead>
          <tbody>
            {ventas.map((v, i) => (
              <tr key={v.id_factura ?? i}>
                <td>#{v.id_factura}</td>
                <td>{v.cliente ?? v.id_cliente}</td>
                <td>{v.empleado ?? v.id_empleado}</td>
                <td style={{ fontWeight: 700 }}>${v.total ?? v.valor_total ?? '—'}</td>
                <td>{v.fecha?.slice(0, 10)}</td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', background: v.estado === 'anulada' ? '#fee2e2' : '#dcfce7', color: v.estado === 'anulada' ? '#991b1b' : '#166534' }}>
                    {v.estado ?? 'activa'}
                  </span>
                </td>
                <td>
                  {v.estado !== 'anulada' && (
                    <button onClick={() => handleAnular(v.id_factura)} style={{ ...btnDanger, fontSize: '0.78rem', padding: '3px 8px' }}>
                      Anular
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ventas.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af' }}>Sin ventas registradas.</p>}
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
