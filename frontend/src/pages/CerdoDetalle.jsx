import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  getCerdo, 
  getHistorialPeso, 
  trasladarCerdo, 
  registrarMuerte,
  getVentaCerdo,
  getMortalidadCerdo,
  getTrasladosCerdo,
  getAlimentacionCerdo,
  getRevisionesCerdo,
  getPesajesCerdo
} from '../api/cerdos.api.js'
import { getCochineras } from '../api/cochineras.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, btnDanger, card } from '../components/FormField.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import DataTable from '../components/DataTable.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import Breadcrumb from '../components/Breadcrumb'

const badgeStyle = (estado) => {
  let bg = '#f3f4f6'
  let color = '#6b7280'
  if (estado === 'Activo') { bg = '#dcfce7'; color = '#166534' }
  else if (estado === 'Vendido') { bg = '#dbeafe'; color = '#1e40af' }
  else if (estado === 'Muerto') { bg = '#fee2e2'; color = '#991b1b' }
  return {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 700,
    background: bg,
    color: color,
    textTransform: 'uppercase'
  }
}

const tabButtonStyle = (active) => ({
  padding: '0.6rem 1.2rem',
  cursor: 'pointer',
  border: 'none',
  background: active ? '#fff' : 'transparent',
  borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
  fontWeight: active ? '700' : '500',
  color: active ? '#2563eb' : '#6b7280',
  transition: 'all 0.2s',
  fontSize: '0.9rem'
})

export default function CerdoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [historial, setHistorial] = useState([])
  const [venta, setVenta] = useState(null)
  const [mortalidad, setMortalidad] = useState(null)
  const [traslados, setTraslados] = useState([])
  const [cochineras, setCochineras] = useState([])
  
  // History Tabs
  const [activeTab, setActiveTab] = useState(1) // 1: Alimentación, 2: Revisiones, 3: Pesajes
  const [alimentacion, setAlimentacion] = useState([])
  const [revisiones, setRevisiones] = useState([])
  const [pesajes, setPesajes] = useState([])

  const [modal, setModal] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  const trasladarForm = useForm()
  const muerteForm = useForm()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [rCerdo, rPeso, rTraslados, rAlim, rRev, rPes, rCoch] = await Promise.all([
        getCerdo(id),
        getHistorialPeso(id),
        getTrasladosCerdo(id),
        getAlimentacionCerdo(id),
        getRevisionesCerdo(id),
        getPesajesCerdo(id),
        getCochineras()
      ])
      
      setData(rCerdo.data)
      setHistorial(rPeso.data)
      setTraslados(rTraslados.data)
      setAlimentacion(rAlim.data)
      setRevisiones(rRev.data)
      setPesajes(rPes.data)
      setCochineras(rCoch.data)

      if (rCerdo.data.cerdo.estado_cerdo === 'Vendido') {
        const rVenta = await getVentaCerdo(id)
        setVenta(rVenta.data)
      } else if (rCerdo.data.cerdo.estado_cerdo === 'Muerto') {
        const rMort = await getMortalidadCerdo(id)
        setMortalidad(rMort.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar ficha del cerdo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  function requestTraslado(values) {
    setConfirmAction({ type: 'trasladar', values })
  }

  function requestMuerte(values) {
    setConfirmAction({ type: 'muerte', values })
  }

  async function onTrasladar() {
    await trasladarCerdo(id, confirmAction.values)
    setConfirmAction(null)
    setModal(null)
    loadData()
  }

  async function onMuerte() {
    await registrarMuerte(id, confirmAction.values)
    setConfirmAction(null)
    setModal(null)
    loadData()
  }

  const columnsTraslados = useMemo(() => [
    { header: 'Fecha', accessorFn: row => new Date(row.fecha_traslado).toLocaleString() },
    { 
      header: 'Origen', 
      accessorKey: 'id_cochinera_origen',
      cell: info => info.getValue() ? <Link to={`/cochineras/${info.getValue()}`} style={{ color: '#2563eb' }}>Cochinera #{info.getValue()}</Link> : <span style={{ color: '#16a34a', fontWeight: 600 }}>Ingreso inicial</span>
    },
    { 
      header: 'Destino', 
      accessorKey: 'id_cochinera_destino',
      cell: info => <Link to={`/cochineras/${info.getValue()}`} style={{ color: '#2563eb' }}>Cochinera #{info.getValue()}</Link>
    },
    { header: 'Motivo', accessorKey: 'motivo' }
  ], [])

  const columnsAlimentacion = useMemo(() => [
    { header: 'Fecha', accessorFn: row => new Date(row.fecha_registro).toLocaleString() },
    { header: 'Empleado', accessorKey: 'empleado' },
    { header: 'Alimento', accessorKey: 'alimento' },
    { header: 'Cantidad', accessorFn: row => `${row.cantidad_consumida} ${row.unidad}` },
    { header: 'Observaciones', accessorKey: 'observaciones' }
  ], [])

  const columnsRevisiones = useMemo(() => [
    { header: 'Fecha', accessorFn: row => new Date(row.fecha_registro).toLocaleString() },
    { header: 'Empleado', accessorKey: 'empleado' },
    { header: 'Diagnóstico', accessorKey: 'diagnostico' },
    { header: 'Medicamento', accessorKey: 'medicamento', cell: info => info.getValue() || <span style={{ color: '#9ca3af' }}>Sin medicamento</span> },
    { header: 'Observaciones', accessorKey: 'observaciones' }
  ], [])

  const columnsPesajesTable = useMemo(() => [
    { header: 'Fecha', accessorFn: row => new Date(row.fecha_pesaje).toLocaleString() },
    { header: 'Empleado', accessorKey: 'empleado' },
    { header: 'Peso (kg)', accessorKey: 'peso_kg' },
    { header: 'Observaciones', accessorKey: 'observaciones' }
  ], [])

  if (loading) return <LoadingSpinner message="Cargando ficha del animal..." />
  if (error) return <ErrorMessage message={error} onRetry={loadData} />
  if (!data) return <p style={{ padding: '2rem' }}>No se encontró información del animal.</p>

  const { cerdo, genealogia } = data
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Cerdos', path: '/cerdos' },
    { label: `Cerdo #${id}`, path: `/cerdos/${id}` }
  ]

  const gdpPromedio = historial.length >= 2 
    ? (historial.reduce((acc, h) => acc + (parseFloat(h.gdp) || 0), 0) / (historial.length - 1)).toFixed(2)
    : 0

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={`Cerdo #${id}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={badgeStyle(cerdo.estado_cerdo)}>{cerdo.estado_cerdo}</span>
          {cerdo.estado_cerdo === 'Activo' && (
            <>
              <button style={btnPrimary} onClick={() => setModal('trasladar')}>Trasladar</button>
              <button style={btnDanger} onClick={() => setModal('muerte')}>Registrar muerte</button>
            </>
          )}
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Datos Básicos */}
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' }}>Datos Básicos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x 2rem' }}>
            <Detail label="Sexo" value={cerdo.sexo_cerdo} />
            <Detail label="Raza" value={cerdo.raza} />
            <Detail label="Fecha Nacimiento" value={new Date(cerdo.fecha_nacimiento).toLocaleDateString()} />
            <Detail label="Edad" value={`${cerdo.edad_dias ?? '—'} días`} />
            <Detail label="Último peso" value={`${cerdo.ultimo_peso_kg ?? '—'} kg`} />
            <Detail label="Estado" value={<span style={badgeStyle(cerdo.estado_cerdo)}>{cerdo.estado_cerdo}</span>} />
            <Detail label="Cochinera Actual" value={
              cerdo.id_cochinera_actual 
                ? `Cochinera #${cerdo.id_cochinera_actual}`
                : <span style={{ color: '#9ca3af' }}>Sin asignar</span>
            } />
          </div>
        </div>

        {/* Información Condicional (Venta o Muerte) */}
        {cerdo.estado_cerdo === 'Vendido' && venta && (
          <div style={{ ...card, borderLeft: '4px solid #2563eb' }}>
            <h3 style={{ marginTop: 0, color: '#1e40af' }}>Información de Venta</h3>
            <Detail label="Factura" value={`#${venta.id_factura}`} />
            <Detail label="Fecha Venta" value={new Date(venta.fecha_venta).toLocaleDateString()} />
            <Detail label="Precio" value={`$ ${parseFloat(venta.precio_venta_cop).toLocaleString()}`} />
            <Detail label="Cliente" value={venta.cliente} />
            <Detail label="Cédula" value={venta.cedula_cliente} />
            <Detail label="Teléfono" value={venta.telefono} />
          </div>
        )}

        {cerdo.estado_cerdo === 'Muerto' && mortalidad && (
          <div style={{ ...card, borderLeft: '4px solid #dc2626' }}>
            <h3 style={{ marginTop: 0, color: '#991b1b' }}>Información de Deceso</h3>
            <Detail label="Fecha Deceso" value={new Date(mortalidad.fecha_deceso).toLocaleString()} />
            <Detail label="Causa" value={mortalidad.causa_muerte} />
            <Detail label="Método Disposición" value={mortalidad.metodo_disposicion} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Gráfica de Peso */}
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Evolución de Peso</h3>
          {historial.length >= 2 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historial}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha_pesaje" tickFormatter={(d) => new Date(d).toLocaleDateString()} fontSize={10} />
                  <YAxis unit=" kg" fontSize={10} />
                  <Tooltip 
                    labelFormatter={(d) => new Date(d).toLocaleString()}
                    formatter={(value, name, props) => {
                      if (name === 'peso_kg') return [`${value} kg`, 'Peso'];
                      if (name === 'gdp') return [`${value} kg/día`, 'GDP'];
                      return [value, name];
                    }}
                  />
                  <Line type="monotone" dataKey="peso_kg" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <Stat label="Peso Inicial" value={`${historial[0].peso_kg} kg`} />
                <Stat label="Peso Actual" value={`${historial[historial.length-1].peso_kg} kg`} />
                <Stat label="GDP Promedio" value={`${gdpPromedio} kg/día`} />
                <Stat label="Pesajes" value={historial.length} />
              </div>
            </>
          ) : (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              Se necesitan al menos 2 pesajes para mostrar la evolución de peso y rendimiento.
            </div>
          )}
        </div>

        {/* Árbol Genealógico */}
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Ancestros y Linaje</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '0.75rem' }}>Relación</th>
                  <th style={{ padding: '0.75rem' }}>ID</th>
                  <th style={{ padding: '0.75rem' }}>Sexo</th>
                  <th style={{ padding: '0.75rem' }}>Raza</th>
                </tr>
              </thead>
              <tbody>
                {genealogia.map((g, i) => {
                  let relacion = g.generacion === 0 ? 'Este cerdo' :
                                 g.generacion === 1 ? (g.sexo === 'Macho' ? 'Padre' : 'Madre') :
                                 g.generacion === 2 ? (g.sexo === 'Macho' ? 'Abuelo' : 'Abuela') :
                                 g.generacion === 3 ? (g.sexo === 'Macho' ? 'Bisabuelo' : 'Bisabuela') :
                                 `Ancestro (G${g.generacion})`;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: g.generacion === 0 ? '#f8fafc' : 'transparent' }}>
                      <td style={{ padding: '0.75rem', fontWeight: g.generacion === 0 ? 700 : 500 }}>{relacion}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <Link to={`/cerdos/${g.id_cerdo}`} style={{ color: '#2563eb', fontWeight: 600 }}>#{g.id_cerdo}</Link>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{g.sexo}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{g.raza}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Historial de Traslados */}
      <div style={{ ...card, marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Historial de Ubicaciones</h3>
        <DataTable data={traslados} columns={columnsTraslados} />
      </div>

      {/* Historial Operativo (Tabs) */}
      <div style={card}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Historial de Registros</h3>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
          <button style={tabButtonStyle(activeTab === 1)} onClick={() => setActiveTab(1)}>Alimentación</button>
          <button style={tabButtonStyle(activeTab === 2)} onClick={() => setActiveTab(2)}>Revisiones Médicas</button>
          <button style={tabButtonStyle(activeTab === 3)} onClick={() => setActiveTab(3)}>Pesajes</button>
        </div>
        
        <DataTable 
          data={activeTab === 1 ? alimentacion : activeTab === 2 ? revisiones : pesajes} 
          columns={activeTab === 1 ? columnsAlimentacion : activeTab === 2 ? columnsRevisiones : columnsPesajesTable} 
        />
      </div>

      {/* Modales */}
      {modal === 'trasladar' && (
        <Modal title={`Trasladar Cerdo #${id}`} onClose={() => setModal(null)}>
          <form onSubmit={trasladarForm.handleSubmit(requestTraslado)}>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Cochinera actual:</p>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                {cerdo.id_cochinera_actual ? `Cochinera #${cerdo.id_cochinera_actual}` : 'Sin asignar'}
              </p>
            </div>

            <FormField label="Cochinera destino">
              <select style={inputStyle} {...trasladarForm.register('id_cochinera_destino', { required: true })}>
                <option value="">Seleccione cochinera...</option>
                {cochineras
                  .filter(c => c.estado_cochinera !== 'En Mantenimiento' && (c.espacios_libres > 0 || c.id_cochinera === cerdo.id_cochinera_actual))
                  .map(c => (
                    <option key={c.id_cochinera} value={c.id_cochinera}>
                      Cochinera #{c.id_cochinera} ({c.espacios_libres} espacios libres)
                    </option>
                  ))
                }
              </select>
            </FormField>
            
            <FormField label="Motivo">
              <textarea style={inputStyle} rows={3} {...trasladarForm.register('motivo')} placeholder="Ej: Cambio por crecimiento" />
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%', marginTop: '1rem' }}>Confirmar traslado</button>
          </form>
        </Modal>
      )}

      {modal === 'muerte' && (
        <Modal title="Registrar muerte" onClose={() => setModal(null)}>
          <form onSubmit={muerteForm.handleSubmit(requestMuerte)}>
            <FormField label="Causa del deceso">
              <textarea style={inputStyle} rows={2} {...muerteForm.register('causa', { required: true })} placeholder="Ej: Causas naturales" />
            </FormField>
            <FormField label="Método de disposición">
              <input style={inputStyle} {...muerteForm.register('metodo_disposicion')} placeholder="Ej: Incineración" />
            </FormField>
            <button type="submit" style={{ ...btnDanger, width: '100%', marginTop: '1rem' }}>Registrar Deceso</button>
          </form>
        </Modal>
      )}

      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'trasladar' ? 'Confirmar traslado' : 'Registrar muerte'}
        message={
          confirmAction?.type === 'trasladar'
            ? `¿Trasladar cerdo #${id} de ${cerdo.id_cochinera_actual ? `Cochinera #${cerdo.id_cochinera_actual}` : 'sin asignar'} a Cochinera #${confirmAction.values.id_cochinera_destino}?`
            : `¿Confirmas que el cerdo #${id} ha fallecido? Esta acción es irreversible y cambiará su estado a Muerto permanentemente.`
        }
        confirmColor={confirmAction?.type === 'trasladar' ? 'blue' : 'red'}
        onConfirm={confirmAction?.type === 'trasladar' ? onTrasladar : onMuerte}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{value ?? '—'}</span>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>{value}</div>
    </div>
  )
}
