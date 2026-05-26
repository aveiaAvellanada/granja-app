import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { 
  getReportesMensuales, 
  generarReporteMes, 
  getAuditoriaEventos, 
  getAppLogs, 
  getDashboardCache 
} from '../api/reportes.js'
import PageHeader from '../components/PageHeader.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import FormField from '../components/FormField.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ExportButton from '../components/ExportButton'
import Breadcrumb from '../components/Breadcrumb'
import { Icon } from '../components/Icon.jsx'

export default function Reportes() {
  const [activeTab, setActiveTab] = useState(1)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [jsonView, setJsonView] = useState(null)
  
  // Filters for Audit and Logs
  const [auditParams, setAuditParams] = useState({ tabla: '', accion: '', limite: 100 })
  const [logParams, setLogParams] = useState({ nivel: '', limite: 50 })

  const { register, handleSubmit } = useForm()

  const reloadData = async () => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (activeTab === 1) res = await getReportesMensuales()
      else if (activeTab === 2) res = await getAuditoriaEventos(auditParams)
      else if (activeTab === 3) res = await getAppLogs(logParams)
      else if (activeTab === 4) res = await getDashboardCache()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reloadData()
  }, [activeTab, auditParams, logParams])

  const onGenerarReporte = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      await generarReporteMes(formData)
      setModal(null)
      reloadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  // --- COLUMNS ---

  const columnsReportes = useMemo(() => [
    { header: 'Periodo', accessorFn: row => `${row.nombre_mes} ${row.anio}`, cell: info => <span className="text-strong">{info.getValue()}</span> },
    { header: 'Cerdos Act.', accessorFn: row => row.metricas?.['Cerdos Activos'] || 0 },
    { header: 'Ingresos', accessorFn: row => row.metricas?.['Nuevos Ingresos'] || 0, cell: info => <span style={{ color: 'var(--green-accent)' }}>+{info.getValue()}</span> },
    { header: 'Bajas', accessorFn: row => row.metricas?.['Mortalidad'] || 0, cell: info => <span style={{ color: 'var(--rust)' }}>-{info.getValue()}</span> },
    { header: 'Ventas', accessorFn: row => row.metricas?.['Ventas'] || 0 },
    { header: 'Operaciones', accessorFn: row => (row.metricas?.['Alimentaciones'] || 0) + (row.metricas?.['Pesajes'] || 0) + (row.metricas?.['Revisiones Médicas'] || 0) },
    { header: 'Generado', accessorFn: row => new Date(row.fecha_generado).toLocaleDateString(), cell: info => <span className="text-muted" style={{ fontSize: '0.8rem' }}>{info.getValue()}</span> }
  ], [])

  const columnsAuditoria = useMemo(() => [
    { header: 'Fecha y Hora', accessorFn: row => new Date(row.fecha_hora).toLocaleString(), cell: info => <span className="text-muted">{info.getValue()}</span> },
    { header: 'Entidad', accessorKey: 'tabla_origen', cell: info => <span className="badge badge-mono">{info.getValue()}</span> },
    { header: 'ID Registro', accessorKey: 'id_registro', cell: info => <span className="text-mono">#{info.getValue()}</span> },
    { 
      header: 'Operación', 
      accessorKey: 'accion',
      cell: info => {
        const val = info.getValue()
        if (val === 'I') return <span className="badge badge-success">INSERT</span>
        if (val === 'U') return <span className="badge badge-info">UPDATE</span>
        if (val === 'D') return <span className="badge badge-danger">DELETE</span>
        return <span className="badge">{val}</span>
      }
    },
    { header: 'Actor BD', accessorKey: 'usuario_bd', cell: info => <span className="text-strong" style={{ fontSize: '0.85rem' }}>{info.getValue()}</span> },
    { header: 'Sinc', accessorKey: 'sincronizado', cell: info => info.getValue() ? <Icon name="shield" size={14} color="var(--green-accent)" /> : <Icon name="alert" size={14} color="var(--amber)" /> },
    { 
      header: 'Datos', 
      id: 'datos',
      cell: info => <button className="btn btn-ghost btn-sm" onClick={() => setJsonView(info.row.original.datos)}><Icon name="search" size={12} /> JSON</button>
    }
  ], [])

  const columnsLogs = useMemo(() => [
    { header: 'Timestamp', accessorFn: row => new Date(row.fecha).toLocaleString(), cell: info => <span className="text-muted">{info.getValue()}</span> },
    { 
      header: 'Severidad', 
      accessorKey: 'nivel',
      cell: info => {
        const val = info.getValue()
        let cls = 'badge-info'
        if (val === 'WARN') cls = 'badge-amber'
        if (val === 'ERROR') cls = 'badge-danger'
        return <span className={`badge ${cls}`}>{val}</span>
      }
    },
    { header: 'Módulo', accessorKey: 'modulo', cell: info => <span className="text-strong" style={{ fontSize: '0.85rem' }}>{info.getValue()}</span> },
    { header: 'Mensaje de Evento', accessorKey: 'mensaje' },
    { header: 'Usuario', accessorKey: 'usuario', cell: info => <span className="text-muted">{info.getValue()}</span> }
  ], [])

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Reportes y Auditoría', path: '/reportes' }
  ]

  return (
    <div className="page-animate">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Centro de Control" icon={<Icon name="chart" size={20} />}>
        <div className="row gap-2">
          {(activeTab === 1 || activeTab === 2) && <ExportButton data={data} filename={activeTab === 1 ? 'Reportes_Mensuales' : 'Auditoria_Eventos'} />}
          {activeTab === 1 && (
            <button className="btn btn-primary" onClick={() => setModal('generar')}>
              <Icon name="plus" size={14} /> Consolidar mes actual
            </button>
          )}
        </div>
      </PageHeader>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 1 ? 'is-active' : ''}`} onClick={() => setActiveTab(1)}>
          <Icon name="clipboard" size={14} /> Métricas Mensuales
        </button>
        <button className={`tab-btn ${activeTab === 2 ? 'is-active' : ''}`} onClick={() => setActiveTab(2)}>
          <Icon name="shield" size={14} /> Auditoría (DB)
        </button>
        <button className={`tab-btn ${activeTab === 3 ? 'is-active' : ''}`} onClick={() => setActiveTab(3)}>
          <Icon name="alert" size={14} /> Logs de Aplicación
        </button>
        <button className={`tab-btn ${activeTab === 4 ? 'is-active' : ''}`} onClick={() => setActiveTab(4)}>
          <Icon name="box" size={14} /> Cache / MongoDB
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div className="row-between flex-wrap gap-4">
          <div className="row-center gap-3">
            <h4 className="section-title" style={{ margin: 0 }}>
              <span className="dot" />
              {activeTab === 1 && "Histórico de Rendimiento Operativo"}
              {activeTab === 2 && "Registro de Transacciones SQL"}
              {activeTab === 3 && "Eventos de Servidor y Cliente"}
              {activeTab === 4 && "Estado de Sincronización Atlas"}
            </h4>
            <span className="badge badge-success badge-mono" style={{ textTransform: 'none' }}>MongoDB Atlas</span>
          </div>

          <div className="row-center gap-3">
            {activeTab === 2 && (
              <>
                <div className="row-center gap-2">
                  <span className="eyebrow">Tabla:</span>
                  <select className="input" style={{ width: 140, padding: '5px 10px' }} value={auditParams.tabla} onChange={e => setAuditParams({...auditParams, tabla: e.target.value})}>
                    <option value="">Todas</option>
                    <option value="cerdo">Cerdo</option>
                    <option value="cochinera">Cochinera</option>
                    <option value="factura">Factura</option>
                    <option value="empleado">Empleado</option>
                    <option value="inventario">Inventario</option>
                    <option value="alimentacion">Alimentación</option>
                  </select>
                </div>
                <div className="row-center gap-2">
                  <span className="eyebrow">Acción:</span>
                  <select className="input" style={{ width: 120, padding: '5px 10px' }} value={auditParams.accion} onChange={e => setAuditParams({...auditParams, accion: e.target.value})}>
                    <option value="">Todas</option>
                    <option value="I">Insert (I)</option>
                    <option value="U">Update (U)</option>
                    <option value="D">Delete (D)</option>
                  </select>
                </div>
              </>
            )}
            {activeTab === 3 && (
              <div className="row-center gap-2">
                <span className="eyebrow">Nivel:</span>
                <select className="input" style={{ width: 120, padding: '5px 10px' }} value={logParams.nivel} onChange={e => setLogParams({...logParams, nivel: e.target.value})}>
                  <option value="">Todos</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
            )}
            {(activeTab === 2 || activeTab === 3) && (
              <div className="row-center gap-2">
                <span className="eyebrow">Límite:</span>
                <select className="input" style={{ width: 80, padding: '5px 10px' }} value={activeTab === 2 ? auditParams.limite : logParams.limite} onChange={e => activeTab === 2 ? setAuditParams({...auditParams, limite: e.target.value}) : setLogParams({...logParams, limite: e.target.value})}>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  {activeTab === 2 && <option value="500">500</option>}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Consultando clúster de base de datos..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reloadData} />
      ) : activeTab !== 4 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable data={Array.isArray(data) ? data : []} columns={activeTab === 1 ? columnsReportes : activeTab === 2 ? columnsAuditoria : columnsLogs} />
        </div>
      ) : (
        <div style={cacheGrid}>
          {Array.isArray(data) && data.length > 0 ? data.map((c, i) => (
            <div key={i} className="card col gap-3" style={{ borderTop: '4px solid var(--green)' }}>
              <div className="row-between">
                <h4 className="text-display" style={{ fontSize: '0.9rem', color: 'var(--green-ink)' }}>{(c.tipo_cache || 'General').replace(/_/g, ' ').toUpperCase()}</h4>
                <Icon name="box" size={16} color="var(--green-accent)" />
              </div>
              <div className="divider" style={{ margin: '4px 0' }} />
              <div className="col gap-2">
                <div className="row-between">
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Última actualización:</span>
                  <span className="text-strong" style={{ fontSize: '0.8rem' }}>{c.fecha_actualizacion ? new Date(c.fecha_actualizacion).toLocaleTimeString() : 'N/A'}</span>
                </div>
                <div className="row-between">
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Persistencia (TTL):</span>
                  <span className="badge badge-mono">{c.tipo_cache === 'ventas_mensuales' ? '24h' : '1h'}</span>
                </div>
                {c.tipo_cache === 'ventas_mensuales' && (
                  <div className="row-between">
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Año fiscal:</span>
                    <span className="text-strong">{c.anio}</span>
                  </div>
                )}
                {c.tipo_cache !== 'ventas_mensuales' && (
                  <div className="row-between">
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Registros en memoria:</span>
                    <span className="text-strong">{Array.isArray(c.datos) ? c.datos.length : 'N/A'}</span>
                  </div>
                )}
              </div>
              <button className="btn btn-secondary btn-sm btn-block" style={{ marginTop: 8 }} onClick={() => setJsonView(c.datos)}>
                <Icon name="search" size={12} /> Explorar Estructura JSON
              </button>
            </div>
          )) : (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center' }}>
              <Icon name="box" size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p className="text-muted">No se detectaron volcados de cache en el clúster de MongoDB Atlas.</p>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {modal === 'generar' && (
        <Modal title="Generar Consolidado Mensual" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onGenerarReporte)}>
            <div className="badge badge-amber" style={{ width: '100%', padding: '10px', marginBottom: '1.5rem', borderRadius: 'var(--r-md)', textTransform: 'none' }}>
              <Icon name="alert" size={16} /> Esta acción recalcula métricas desde PostgreSQL y actualiza MongoDB.
            </div>
            <div className="row gap-3">
              <div style={{ flex: 1 }}>
                <FormField label="Año Fiscal">
                  <input className="input text-mono" type="number" defaultValue={new Date().getFullYear()} {...register('anio', { required: true })} />
                </FormField>
              </div>
              <div style={{ flex: 1 }}>
                <FormField label="Mes de Reporte">
                  <select className="input" defaultValue={new Date().getMonth() + 1} {...register('mes', { required: true })}>
                    <option value="1">Enero</option>
                    <option value="2">Febrero</option>
                    <option value="3">Marzo</option>
                    <option value="4">Abril</option>
                    <option value="5">Mayo</option>
                    <option value="6">Junio</option>
                    <option value="7">Julio</option>
                    <option value="8">Agosto</option>
                    <option value="9">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                </FormField>
              </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Procesando...' : 'Iniciar Consolidación'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {jsonView && (
        <Modal title="Estructura de Datos (JSON)" onClose={() => setJsonView(null)}>
          <div style={{ background: 'var(--forest)', padding: '1.25rem', borderRadius: 'var(--r-md)', border: '1px solid var(--forest-line)' }}>
            <pre className="scroll-dark" style={{ margin: 0, color: 'var(--ink-on-dark)', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '450px', fontFamily: 'var(--font-mono)' }}>
              {JSON.stringify(jsonView, null, 2)}
            </pre>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-secondary btn-block" onClick={() => setJsonView(null)}>Cerrar Inspector</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

const cacheGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.25rem'
}
