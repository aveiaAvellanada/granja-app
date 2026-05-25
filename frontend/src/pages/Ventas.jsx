import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getVentas, registrarVenta, anularFactura, getDetalleVenta } from '../api/ventas.api.js'
import { getClientes } from '../api/clientes.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, btnDanger, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

const formatMoneda = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val)

const formatearFechaLarga = (fechaStr) => {
  if (!fechaStr) return '—'
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(fechaStr).toLocaleDateString('es-CO', opciones)
}

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [detalleModal, setDetalleModal] = useState(null)
  const [detalleInfo, setDetalleInfo] = useState([])
  const [confirmAnularId, setConfirmAnularId] = useState(null)
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

  async function handleAnular() {
    await anularFactura(confirmAnularId)
    setConfirmAnularId(null)
    setDetalleModal(null)
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
    { header: 'Total', accessorFn: row => row.total_cop, cell: info => <span style={{ fontWeight: 700 }}>{formatMoneda(info.getValue() ?? 0)}</span> },
    { header: 'Fecha', accessorKey: 'fecha_venta', cell: info => info.getValue()?.slice(0, 10) },
    { 
      header: 'Estado', 
      accessorKey: 'estado_factura',
      cell: info => {
        const estado = info.getValue() ?? 'Pendiente';
        const bg = estado === 'Completada' ? '#dcfce7' : estado === 'Anulada' ? '#fee2e2' : '#fef3c7';
        const fg = estado === 'Completada' ? '#166534' : estado === 'Anulada' ? '#991b1b' : '#92400e';
        return (
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', background: bg, color: fg }}>
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
            {v.estado_factura === 'Completada' && (
              <button onClick={() => setConfirmAnularId(v.id_factura)} style={{ ...btnDanger, fontSize: '0.78rem', padding: '3px 8px' }}>
                Anular
              </button>
            )}
          </div>
        )
      }
    }
  ], [])

  const primerDetalle = detalleInfo.length > 0 ? detalleInfo[0] : null;
  const totalFactura = detalleInfo.reduce((acc, d) => acc + Number(d.precio_venta_cop), 0);

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #seccion-impresion, #seccion-impresion * { visibility: visible; }
          #seccion-impresion { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>
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

      {detalleModal && primerDetalle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '95%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div id="seccion-impresion" style={{ padding: '2rem', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: '#111827' }}>Factura #{detalleModal}</h1>
                  <div style={{ color: '#6b7280' }}>Emitida: {formatearFechaLarga(primerDetalle.fecha_venta)}</div>
                </div>
                <div>
                  {(() => {
                    const st = primerDetalle.estado_factura;
                    const bg = st === 'Completada' ? '#dcfce7' : st === 'Anulada' ? '#fee2e2' : '#fef3c7';
                    const fg = st === 'Completada' ? '#166534' : st === 'Anulada' ? '#991b1b' : '#92400e';
                    return <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.9rem', fontWeight: 600, background: bg, color: fg }}>{st}</span>
                  })()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#374151' }}>Datos del Cliente</h3>
                  <div style={{ color: '#4b5563', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 600 }}>{primerDetalle.nombre_cliente}</div>
                    <div>Cédula: {primerDetalle.cedula_cliente}</div>
                    <div>Tel: {primerDetalle.telefono_cliente ?? 'N/A'}</div>
                    <div>Email: {primerDetalle.correo_cliente ?? 'N/A'}</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#374151' }}>Datos del Empleado</h3>
                  <div style={{ color: '#4b5563', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 600 }}>{primerDetalle.nombre_empleado}</div>
                  </div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>#</th>
                    <th style={{ padding: '0.75rem 1rem' }}>ID Cerdo</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Sexo</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Raza</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Precio de Venta</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleInfo.map((d, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>#{d.id_cerdo}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{d.sexo_cerdo}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{d.raza}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{formatMoneda(d.precio_venta_cop)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '2px solid #e5e7eb' }}>
                <div style={{ width: '300px', fontSize: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#4b5563' }}>Cant. Animales:</span>
                    <span style={{ fontWeight: 600 }}>{detalleInfo.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
                    <span>Total General:</span>
                    <span>{formatMoneda(totalFactura)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print" style={{ padding: '1rem 2rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setDetalleModal(null)} style={{ padding: '0.5rem 1.5rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                Cerrar
              </button>
              <button onClick={() => window.print()} style={{ padding: '0.5rem 1.5rem', background: '#3b82f6', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#fff' }}>
                Imprimir
              </button>
              {primerDetalle.estado_factura === 'Completada' && (
                <button onClick={() => setConfirmAnularId(detalleModal)} style={{ padding: '0.5rem 1.5rem', background: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#fff' }}>
                  Anular factura
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmAnularId}
        title="Anular factura"
        message={`¿Seguro que deseas anular la factura #${confirmAnularId}? Los cerdos vendidos volverán a estado Activo y la factura quedará marcada como Anulada.`}
        confirmColor="red"
        onConfirm={handleAnular}
        onCancel={() => setConfirmAnularId(null)}
      />
    </div>
  )
}