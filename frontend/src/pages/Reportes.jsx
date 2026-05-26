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
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ExportButton from '../components/ExportButton'
import Breadcrumb from '../components/Breadcrumb'

const tabButtonStyle = (active) => ({
  padding: '0.75rem 1.5rem',
  cursor: 'pointer',
  border: 'none',
  background: active ? '#fff' : 'transparent',
  borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
  fontWeight: active ? '700' : '500',
  color: active ? '#2563eb' : '#6b7280',
  transition: 'all 0.2s'
})

const mongoBadge = {
  background: '#dcfce7',
  color: '#166534',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.7rem',
  fontWeight: 700,
  marginLeft: '10px',
  verticalAlign: 'middle'
}

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
    { header: 'Año', accessorKey: 'anio' },
    { header: 'Mes', accessorKey: 'nombre_mes' },
    { header: 'Cerdos Activos', accessorFn: row => row.metricas?.['Cerdos Activos'] || 0 },
    { header: 'Nuevos', accessorFn: row => row.metricas?.['Nuevos Ingresos'] || 0 },
    { header: 'Muertes', accessorFn: row => row.metricas?.['Mortalidad'] || 0 },
    { header: 'Ventas', accessorFn: row => row.metricas?.['Ventas'] || 0 },
    { header: 'Alimentaciones', accessorFn: row => row.metricas?.['Alimentaciones'] || 0 },
    { header: 'Pesajes', accessorFn: row => row.metricas?.['Pesajes'] || 0 },
    { header: 'Revisiones', accessorFn: row => row.metricas?.['Revisiones Médicas'] || 0 },
    { header: 'Generado', accessorFn: row => new Date(row.fecha_generado).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  ], [])

  const columnsAuditoria = useMemo(() => [
    { header: 'Fecha', accessorFn: row => new Date(row.fecha_hora).toLocaleString() },
    { header: 'Tabla', accessorKey: 'tabla_origen' },
    { header: 'ID Reg', accessorKey: 'id_registro' },
    { 
      header: 'Acción', 
      accessorKey: 'accion',
      cell: info => {
        const val = info.getValue()
        const colors = { I: '#dcfce7', U: '#dbeafe', D: '#fee2e2' }
        const labels = { I: 'INSERT', U: 'UPDATE', D: 'DELETE' }
        const textColors = { I: '#166534', U: '#1e40af', D: '#991b1b' }
        return <span style={{ padding: '2px 8px', borderRadius: 4, background: colors[val], color: textColors[val], fontWeight: 700, fontSize: '0.75rem' }}>{labels[val]}</span>
      }
    },
    { header: 'Usuario BD', accessorKey: 'usuario_bd' },
    { header: 'Sinc', accessorKey: 'sincronizado', cell: info => info.getValue() ? '✅' : '⏳' },
    { 
      header: 'Datos', 
      id: 'datos',
      cell: info => <button onClick={() => setJsonView(info.row.original.datos)} style={{ fontSize: '0.7rem', padding: '2px 6px', cursor: 'pointer' }}>Ver JSON</button>
    }
  ], [])

  const columnsLogs = useMemo(() => [
    { header: 'Fecha', accessorFn: row => new Date(row.fecha).toLocaleString() },
    { 
      header: 'Nivel', 
      accessorKey: 'nivel',
      cell: info => {
        const val = info.getValue()
        const colors = { INFO: '#dbeafe', WARN: '#fef3c7', ERROR: '#fee2e2' }
        const textColors = { INFO: '#1e40af', WARN: '#92400e', ERROR: '#991b1b' }
        return <span style={{ padding: '2px 8px', borderRadius: 4, background: colors[val], color: textColors[val], fontWeight: 700, fontSize: '0.75rem' }}>{val}</span>
      }
    },
    { header: 'Módulo', accessorKey: 'modulo' },
    { header: 'Mensaje', accessorKey: 'mensaje' },
    { header: 'Usuario', accessorKey: 'usuario' }
  ], [])

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Reportes', path: '/reportes' }
  ]

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="Módulo de Reportes">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(activeTab === 1 || activeTab === 2) && <ExportButton data={data} filename={activeTab === 1 ? 'Reportes_Mensuales' : 'Auditoria_Eventos'} />}
          {activeTab === 1 && (
            <button style={btnPrimary} onClick={() => setModal('generar')}>
              Generar reporte mes actual
            </button>
          )}
        </div>
      </PageHeader>

      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <button style={tabButtonStyle(activeTab === 1)} onClick={() => setActiveTab(1)}>Reportes Mensuales</button>
        <button style={tabButtonStyle(activeTab === 2)} onClick={() => setActiveTab(2)}>Auditoría</button>
        <button style={tabButtonStyle(activeTab === 3)} onClick={() => setActiveTab(3)}>Logs del Sistema</button>
        <button style={tabButtonStyle(activeTab === 4)} onClick={() => setActiveTab(4)}>Cache Dashboard</button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {activeTab === 1 && <h3 style={{ margin: 0 }}>Histórico de Métricas <span style={mongoBadge}>Fuente: MongoDB</span></h3>}
        {activeTab === 2 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, width: '100%' }}>Log de Auditoría <span style={mongoBadge}>Fuente: MongoDB</span></h3>
            <FormField label="Tabla">
              <select style={inputStyle} value={auditParams.tabla} onChange={e => setAuditParams({...auditParams, tabla: e.target.value})}>
                <option value="">Todas</option>
                <option value="cerdo">Cerdo</option>
                <option value="cochinera">Cochinera</option>
                <option value="factura">Factura</option>
                <option value="empleado">Empleado</option>
                <option value="inventario">Inventario</option>
                <option value="alimentacion">Alimentación</option>
              </select>
            </FormField>
            <FormField label="Acción">
              <select style={inputStyle} value={auditParams.accion} onChange={e => setAuditParams({...auditParams, accion: e.target.value})}>
                <option value="">Todas</option>
                <option value="I">Inserción (I)</option>
                <option value="U">Actualización (U)</option>
                <option value="D">Eliminación (D)</option>
              </select>
            </FormField>
            <FormField label="Límite">
              <select style={inputStyle} value={auditParams.limite} onChange={e => setAuditParams({...auditParams, limite: e.target.value})}>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </FormField>
          </div>
        )}
        {activeTab === 3 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, width: '100%' }}>Logs del Sistema <span style={mongoBadge}>Fuente: MongoDB</span></h3>
            <FormField label="Nivel">
              <select style={inputStyle} value={logParams.nivel} onChange={e => setLogParams({...logParams, nivel: e.target.value})}>
                <option value="">Todos</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
              </select>
            </FormField>
            <FormField label="Límite">
              <select style={inputStyle} value={logParams.limite} onChange={e => setLogParams({...logParams, limite: e.target.value})}>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </FormField>
          </div>
        )}
        {activeTab === 4 && <h3 style={{ margin: 0 }}>Estado del Cache <span style={mongoBadge}>Fuente: MongoDB</span></h3>}
      </div>

      {loading ? (
        <LoadingSpinner message="Cargando datos de MongoDB..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reloadData} />
      ) : activeTab !== 4 ? (
        <div style={card}>
          <DataTable data={Array.isArray(data) ? data : []} columns={activeTab === 1 ? columnsReportes : activeTab === 2 ? columnsAuditoria : columnsLogs} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {Array.isArray(data) && data.length > 0 ? data.map((c, i) => (
            <div key={i} style={card}>
              <h4 style={{ marginTop: 0, color: '#2563eb' }}>{(c.tipo_cache || 'Cache Desconocido').replace(/_/g, ' ').toUpperCase()}</h4>
              <p style={{ fontSize: '0.85rem' }}><strong>Último cache:</strong> {c.fecha_actualizacion ? new Date(c.fecha_actualizacion).toLocaleString() : 'Nunca'}</p>
              <p style={{ fontSize: '0.85rem' }}><strong>TTL:</strong> {c.tipo_cache === 'ventas_mensuales' ? '24 horas' : '1 hora'}</p>
              {c.tipo_cache === 'ventas_mensuales' && <p style={{ fontSize: '0.85rem' }}><strong>Año:</strong> {c.anio}</p>}
              {c.tipo_cache !== 'ventas_mensuales' && <p style={{ fontSize: '0.85rem' }}><strong>Items:</strong> {Array.isArray(c.datos) ? c.datos.length : 'N/A'}</p>}
              <button style={{ ...btnPrimary, width: '100%', marginTop: '1rem' }} onClick={() => setJsonView(c.datos)}>Ver datos</button>
            </div>
          )) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              No hay datos de cache disponibles en MongoDB Atlas.
            </p>
          )}
        </div>
      )}

      {/* MODALS */}
      {modal === 'generar' && (
        <Modal title="Generar Reporte Mensual" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onGenerarReporte)}>
            <FormField label="Año">
              <input style={inputStyle} type="number" defaultValue={new Date().getFullYear()} {...register('anio', { required: true })} />
            </FormField>
            <FormField label="Mes">
              <select style={inputStyle} defaultValue={new Date().getMonth() + 1} {...register('mes', { required: true })}>
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
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '1rem 0' }}>Se obtendrán los datos desde PostgreSQL y se consolidarán en MongoDB Atlas.</p>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }} disabled={loading}>{loading ? 'Generando...' : 'Generar y Guardar'}</button>
          </form>
        </Modal>
      )}

      {jsonView && (
        <Modal title="Vista de Datos JSON" onClose={() => setJsonView(null)}>
          <pre style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '400px' }}>
            {JSON.stringify(jsonView, null, 2)}
          </pre>
          <button style={{ ...btnPrimary, width: '100%', marginTop: '1rem' }} onClick={() => setJsonView(null)}>Cerrar</button>
        </Modal>
      )}
    </div>
  )
}
