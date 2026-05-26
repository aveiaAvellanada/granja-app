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
import FormField, { inputStyle } from '../components/FormField.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import DataTable from '../components/DataTable.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import Breadcrumb from '../components/Breadcrumb'
import { Icon } from '../components/Icon.jsx'

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
      cell: info => info.getValue() ? <Link to={`/cochineras/${info.getValue()}`} style={{ color: 'var(--green)', fontWeight: 600 }}>Cochinera #{info.getValue()}</Link> : <span className="badge badge-success">Ingreso inicial</span>
    },
    { 
      header: 'Destino', 
      accessorKey: 'id_cochinera_destino',
      cell: info => <Link to={`/cochineras/${info.getValue()}`} style={{ color: 'var(--green)', fontWeight: 600 }}>Cochinera #{info.getValue()}</Link>
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
    { header: 'Medicamento', accessorKey: 'medicamento', cell: info => info.getValue() || <span className="text-muted">Sin medicamento</span> },
    { header: 'Observaciones', accessorKey: 'observaciones' }
  ], [])

  const columnsPesajesTable = useMemo(() => [
    { header: 'Fecha', accessorFn: row => new Date(row.fecha_pesaje).toLocaleString() },
    { header: 'Empleado', accessorKey: 'empleado' },
    { header: 'Peso (kg)', accessorKey: 'peso_kg', cell: info => <span className="text-strong">{info.getValue()}</span> },
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

  const getStatusBadge = (estado) => {
    if (estado === 'Activo') return 'badge-success'
    if (estado === 'Vendido') return 'badge-info'
    if (estado === 'Muerto') return 'badge-danger'
    return ''
  }

  return (
    <div className="page-animate">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={`Cerdo #${id}`} icon={<Icon name="pig" size={20} />}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className={`badge ${getStatusBadge(cerdo.estado_cerdo)}`}>{cerdo.estado_cerdo}</span>
          {cerdo.estado_cerdo === 'Activo' && (
            <div className="row gap-2">
              <button className="btn btn-secondary" onClick={() => setModal('trasladar')}>
                <Icon name="arrow-right" size={14} /> Trasladar
              </button>
              <button className="btn btn-danger" onClick={() => setModal('muerte')}>
                <Icon name="alert" size={14} /> Registrar muerte
              </button>
            </div>
          )}
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Datos Básicos */}
        <div className="card">
          <h4 className="section-title"><span className="dot" />Datos de Identificación</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
            <Detail label="Sexo" value={cerdo.sexo_cerdo} />
            <Detail label="Raza" value={cerdo.raza} />
            <Detail label="Nacimiento" value={new Date(cerdo.fecha_nacimiento).toLocaleDateString()} />
            <Detail label="Edad" value={`${cerdo.edad_dias ?? '—'} días`} />
            <Detail label="Último peso" value={cerdo.ultimo_peso_kg ? `${cerdo.ultimo_peso_kg} kg` : '—'} />
            <Detail label="Cochinera" value={
              cerdo.id_cochinera_actual 
                ? <Link to={`/cochineras/${cerdo.id_cochinera_actual}`} className="text-strong" style={{ color: 'var(--green)' }}>#{cerdo.id_cochinera_actual}</Link>
                : <span className="text-muted">Sin asignar</span>
            } />
          </div>
        </div>

        {/* Información Condicional (Venta o Muerte) */}
        {cerdo.estado_cerdo === 'Vendido' && venta && (
          <div className="card" style={{ borderLeft: '4px solid var(--info)' }}>
            <h4 className="section-title" style={{ color: 'var(--info-ink)' }}><span className="dot" style={{ background: 'var(--info)' }} />Detalles de la Venta</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
              <Detail label="Factura" value={`#${venta.id_factura}`} />
              <Detail label="Fecha Venta" value={new Date(venta.fecha_venta).toLocaleDateString()} />
              <Detail label="Precio" value={`$ ${parseFloat(venta.precio_venta_cop).toLocaleString()}`} />
              <Detail label="Cliente" value={venta.cliente} />
              <Detail label="Cédula" value={venta.cedula_cliente} />
              <Detail label="Teléfono" value={venta.telefono} />
            </div>
          </div>
        )}

        {cerdo.estado_cerdo === 'Muerto' && mortalidad && (
          <div className="card" style={{ borderLeft: '4px solid var(--rust)' }}>
            <h4 className="section-title" style={{ color: 'var(--rust-ink)' }}><span className="dot" style={{ background: 'var(--rust)' }} />Informe de Deceso</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
              <Detail label="Fecha Deceso" value={new Date(mortalidad.fecha_deceso).toLocaleString()} />
              <Detail label="Causa" value={mortalidad.causa_muerte} />
              <Detail label="Disposición" value={mortalidad.metodo_disposicion} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Gráfica de Peso */}
        <div className="card">
          <h4 className="section-title"><span className="dot" />Curva de Crecimiento</h4>
          {historial.length >= 2 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={historial} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
                  <XAxis dataKey="fecha_pesaje" tick={{ fill: 'var(--ink-3)', fontSize: 10 }} tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                  <YAxis tick={{ fill: 'var(--ink-3)', fontSize: 10 }} unit="kg" />
                  <Tooltip 
                    contentStyle={{ borderRadius: 'var(--r-md)', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-md)' }}
                    labelFormatter={(d) => new Date(d).toLocaleString()}
                    formatter={(value, name) => {
                      if (name === 'peso_kg') return [`${value} kg`, 'Peso'];
                      if (name === 'gdp') return [`${value} kg/día`, 'GDP'];
                      return [value, name];
                    }}
                  />
                  <Line type="monotone" dataKey="peso_kg" stroke="var(--green)" strokeWidth={3} dot={{ r: 4, fill: 'var(--green)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1.5rem', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)' }}>
                <Stat label="Peso Inicial" value={`${historial[0].peso_kg} kg`} />
                <Stat label="Peso Actual" value={`${historial[historial.length-1].peso_kg} kg`} />
                <Stat label="GDP Promedio" value={`${gdpPromedio} kg/d`} color="var(--green-accent)" />
                <Stat label="Pesajes" value={historial.length} />
              </div>
            </>
          ) : (
            <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)', color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem' }}>
              <Icon name="chart" size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ fontSize: '0.85rem' }}>Datos insuficientes para generar curva.<br />Se requieren al menos 2 pesajes.</p>
            </div>
          )}
        </div>

        {/* Árbol Genealógico */}
        <div className="card">
          <h4 className="section-title"><span className="dot" />Linaje y Ancestros</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Relación</th>
                  <th>Identificador</th>
                  <th>Sexo</th>
                  <th>Raza</th>
                </tr>
              </thead>
              <tbody>
                {genealogia.map((g, i) => {
                  let relacion = g.generacion === 0 ? 'Sujeto' :
                                 g.generacion === 1 ? (g.sexo === 'Macho' ? 'Padre' : 'Madre') :
                                 g.generacion === 2 ? (g.sexo === 'Macho' ? 'Abuelo' : 'Abuela') :
                                 g.generacion === 3 ? (g.sexo === 'Macho' ? 'Bisabuelo' : 'Bisabuela') :
                                 `Ancestro (G${g.generacion})`;
                  return (
                    <tr key={i} style={{ background: g.generacion === 0 ? 'var(--surface-sunken)' : 'transparent' }}>
                      <td style={{ fontWeight: g.generacion === 0 ? 700 : 500 }}>{relacion}</td>
                      <td>
                        <Link to={`/cerdos/${g.id_cerdo}`} style={{ color: 'var(--green)', fontWeight: 600 }}>
                          <span className="text-mono">#{g.id_cerdo}</span>
                        </Link>
                      </td>
                      <td>{g.sexo}</td>
                      <td style={{ fontSize: '0.8rem' }} className="text-muted">{g.raza}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Historial de Traslados */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h4 className="section-title"><span className="dot" />Trazabilidad de Instalaciones</h4>
        <DataTable data={traslados} columns={columnsTraslados} />
      </div>

      {/* Historial Operativo (Tabs) */}
      <div className="card">
        <h4 className="section-title"><span className="dot" />Eventos y Seguimiento</h4>
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 1 ? 'is-active' : ''}`} onClick={() => setActiveTab(1)}>
            <Icon name="box" size={14} /> Alimentación
          </button>
          <button className={`tab-btn ${activeTab === 2 ? 'is-active' : ''}`} onClick={() => setActiveTab(2)}>
            <Icon name="shield" size={14} /> Revisiones Médicas
          </button>
          <button className={`tab-btn ${activeTab === 3 ? 'is-active' : ''}`} onClick={() => setActiveTab(3)}>
            <Icon name="chart" size={14} /> Historial de Pesajes
          </button>
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
            <div className="card-accent card-tight" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="barn" size={18} color="var(--green)" />
              </div>
              <div>
                <div className="eyebrow">Instalación Actual</div>
                <div className="text-strong">
                  {cerdo.id_cochinera_actual ? `Cochinera #${cerdo.id_cochinera_actual}` : 'Sin asignar'}
                </div>
              </div>
            </div>

            <FormField label="Instalación de destino">
              <select className="input" {...trasladarForm.register('id_cochinera_destino', { required: true })}>
                <option value="">Seleccione cochinera...</option>
                {cochineras
                  .filter(c => c.estado_cochinera !== 'En Mantenimiento' && (c.espacios_libres > 0 || c.id_cochinera === cerdo.id_cochinera_actual))
                  .map(c => (
                    <option key={c.id_cochinera} value={c.id_cochinera}>
                      Cochinera #{c.id_cochinera} ({c.espacios_libres} libres)
                    </option>
                  ))
                }
              </select>
            </FormField>
            
            <FormField label="Justificación del movimiento">
              <textarea className="input" rows={3} {...trasladarForm.register('motivo')} placeholder="Ej: Separación por peso, mantenimiento de lote..." />
            </FormField>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary btn-block">Confirmar traslado</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'muerte' && (
        <Modal title="Reportar Mortalidad" onClose={() => setModal(null)}>
          <form onSubmit={muerteForm.handleSubmit(requestMuerte)}>
            <div className="badge badge-danger" style={{ width: '100%', padding: '12px', marginBottom: '1.5rem', justifyContent: 'center', borderRadius: 'var(--r-md)', textTransform: 'none' }}>
              <Icon name="alert" size={16} /> Atención: Esta acción dará de baja al animal permanentemente.
            </div>
            <FormField label="Causa probable del deceso">
              <textarea className="input" rows={2} {...muerteForm.register('causa', { required: true })} placeholder="Detalles de la condición..." />
            </FormField>
            <FormField label="Método de disposición final">
              <input className="input" {...muerteForm.register('metodo_disposicion')} placeholder="Ej: Incineración, entierro sanitario..." />
            </FormField>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-danger btn-block">Registrar baja definitiva</button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'trasladar' ? 'Confirmar traslado' : 'Registrar mortalidad'}
        message={
          confirmAction?.type === 'trasladar'
            ? (`¿Confirmas el traslado del cerdo #${id} a la Cochinera #${confirmAction.values.id_cochinera_destino}?`)
            : (`¿Confirmas el deceso del cerdo #${id}? El registro se cerrará de forma irreversible.`)
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
    <div className="row-between" style={{ padding: '0.65rem 0', borderBottom: '1px solid var(--border-soft)' }}>
      <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{label}</span>
      <span className="text-strong" style={{ fontSize: '0.9rem' }}>{value ?? '—'}</span>
    </div>
  )
}

function Stat({ label, value, color = 'var(--ink)' }) {
  return (
    <div className="col" style={{ textAlign: 'center' }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div className="text-strong" style={{ fontSize: '1.1rem', color }}>{value}</div>
    </div>
  )
}
