import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { getCerdos, registrarCerdo } from '../api/cerdos.api.js'
import { getRazas } from '../api/razas.api.js'
import { getCochineras } from '../api/cochineras.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ExportButton from '../components/ExportButton'

const tabButtonStyle = (active) => ({
  padding: '0.75rem 1.5rem',
  cursor: 'pointer',
  border: 'none',
  background: active ? '#FFFFFF' : 'transparent',
  borderBottom: active ? '3px solid #166534' : '3px solid transparent',
  fontWeight: active ? '700' : '500',
  color: active ? '#166534' : '#6B7280',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: '0.875rem',
  transition: 'color 120ms ease',
})

export default function Cerdos() {
  const [activeTab, setActiveTab] = useState('Activo')
  const [data, setData] = useState([])
  const [counters, setCounters] = useState({ Activo: 0, Vendido: 0, Muerto: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const [razas, setRazas] = useState([])
  const [cochineras, setCochineras] = useState([])
  const [allCerdos, setAllCerdos] = useState([]) // For parents dropdown

  const [showModal, setShowModal] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const reloadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch current tab data
      const res = await getCerdos(activeTab)
      setData(res.data)

      // Update counters
      setCounters(prev => ({ ...prev, [activeTab]: res.data.length }))

      // Load auxiliary data for modal if in 'Activo' tab
      if (activeTab === 'Activo') {
        const [rRazas, rCochineras, rAll] = await Promise.all([
          getRazas(),
          getCochineras(),
          getCerdos('Activo') // We reuse this for parents
        ])
        setRazas(rRazas.data)
        setCochineras(rCochineras.data)
        setAllCerdos(rAll.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reloadData()
  }, [activeTab])

  async function onSubmit(data) {
    try {
      const payload = {
        ...data,
        id_padre: data.id_padre || null,
        id_madre: data.id_madre || null
      }
      await registrarCerdo(payload)
      reset()
      setShowModal(false)
      reloadData()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar')
    }
  }

  // --- COLUMNS ---

  const columnsActivos = useMemo(() => [
    { header: 'ID', accessorKey: 'id_cerdo' },
    { header: 'Sexo', accessorKey: 'sexo_cerdo' },
    { header: 'Raza', accessorKey: 'raza', cell: info => info.getValue() ?? '—' },
    { header: 'Edad', accessorKey: 'edad_dias', cell: info => info.getValue() != null ? `${info.getValue()} días` : '—' },
    { header: 'Peso (kg)', accessorKey: 'ultimo_peso_kg', cell: info => info.getValue() ?? '—' },
    { header: 'Cochinera', accessorKey: 'id_cochinera_actual', cell: info => info.getValue() ? `Cochinera #${info.getValue()}` : '—' },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: info => <Link to={`/cerdos/${info.row.original.id_cerdo}`} style={{ color: 'var(--green)', fontWeight: 600 }}>Ver</Link>
    }
  ], [])

  const columnsVendidos = useMemo(() => [
    { header: 'ID', accessorKey: 'id_cerdo' },
    { header: 'Sexo', accessorKey: 'sexo_cerdo' },
    { header: 'Raza', accessorKey: 'raza' },
    { header: 'Edad', accessorKey: 'edad_dias', cell: info => `${info.getValue()} días` },
    { header: 'Fecha Venta', accessorFn: row => new Date(row.fecha_venta).toLocaleDateString() },
    { header: 'Cliente', accessorKey: 'cliente' },
    { 
      header: 'Precio COP', 
      accessorKey: 'precio_venta_cop',
      cell: info => info.getValue() ? `$ ${parseFloat(info.getValue()).toLocaleString('es-CO')}` : '—'
    },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: info => <Link to={`/cerdos/${info.row.original.id_cerdo}`} style={{ color: 'var(--green)', fontWeight: 600 }}>Ver</Link>
    }
  ], [])

  const columnsMuertos = useMemo(() => [
    { header: 'ID', accessorKey: 'id_cerdo' },
    { header: 'Sexo', accessorKey: 'sexo_cerdo' },
    { header: 'Raza', accessorKey: 'raza' },
    { header: 'Edad', accessorKey: 'edad_dias', cell: info => `${info.getValue()} días` },
    { header: 'Fecha Deceso', accessorFn: row => new Date(row.fecha_deceso).toLocaleString() },
    { header: 'Causa Muerte', accessorKey: 'causa_muerte' },
    { header: 'Método Disposición', accessorKey: 'metodo_disposicion' },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: info => <Link to={`/cerdos/${info.row.original.id_cerdo}`} style={{ color: 'var(--green)', fontWeight: 600 }}>Ver</Link>
    }
  ], [])

  return (
    <div>
      <PageHeader title="Inventario de Cerdos">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ExportButton data={data} filename={`Cerdos_${activeTab}`} sheetName={activeTab} />
          {activeTab === 'Activo' && (
            <button style={btnPrimary} onClick={() => { setSubmitError(''); setShowModal(true); }}>+ Registrar cerdo</button>
          )}
        </div>
      </PageHeader>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <button style={tabButtonStyle(activeTab === 'Activo')} onClick={() => setActiveTab('Activo')}>
          Activos ({counters.Activo})
        </button>
        <button style={tabButtonStyle(activeTab === 'Vendido')} onClick={() => setActiveTab('Vendido')}>
          Vendidos ({counters.Vendido})
        </button>
        <button style={tabButtonStyle(activeTab === 'Muerto')} onClick={() => setActiveTab('Muerto')}>
          Muertos ({counters.Muerto})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Cargando cerdos..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reloadData} />
      ) : (
        <div style={card}>
          <DataTable 
            data={data} 
            columns={
              activeTab === 'Activo' ? columnsActivos :
              activeTab === 'Vendido' ? columnsVendidos :
              columnsMuertos
            } 
          />
        </div>
      )}

      {showModal && (
        <Modal title="Registrar cerdo" onClose={() => setShowModal(false)} maxWidth={700}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid-2-col">
              <div className="col gap-4">
                <FormField label="Sexo" error={errors.sexo?.message}>
                  <select style={inputStyle} {...register('sexo', { required: 'Requerido' })}>
                    <option value="">Seleccione...</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </FormField>
                
                <FormField label="Raza" error={errors.id_raza?.message}>
                  <select style={inputStyle} {...register('id_raza', { required: 'Requerido' })}>
                    <option value="">Seleccione raza...</option>
                    {razas.map(r => (
                      <option key={r.id_raza} value={r.id_raza}>{r.descripcion}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Fecha de nacimiento">
                  <input style={inputStyle} type="date" {...register('fecha_nac', { required: 'Requerido' })} />
                </FormField>
              </div>

              <div className="col gap-4">
                <FormField label="Padre (opcional)">
                  <select style={inputStyle} {...register('id_padre')}>
                    <option value="">Sin padre conocido</option>
                    {allCerdos
                      .filter(c => c.sexo_cerdo === 'Macho')
                      .map(c => (
                        <option key={c.id_cerdo} value={c.id_cerdo}>
                          Cerdo #{c.id_cerdo} - {c.raza} - {c.edad_dias} días
                        </option>
                      ))
                    }
                  </select>
                </FormField>

                <FormField label="Madre (opcional)">
                  <select style={inputStyle} {...register('id_madre')}>
                    <option value="">Sin madre conocida</option>
                    {allCerdos
                      .filter(c => c.sexo_cerdo === 'Hembra')
                      .map(c => (
                        <option key={c.id_cerdo} value={c.id_cerdo}>
                          Cerdo #{c.id_cerdo} - {c.raza} - {c.edad_dias} días
                        </option>
                      ))
                    }
                  </select>
                </FormField>

                <FormField label="Cochinera" error={errors.id_cochinera?.message}>
                  <select style={inputStyle} {...register('id_cochinera', { required: 'Requerido' })}>
                    <option value="">Seleccione cochinera...</option>
                    {cochineras
                      .filter(c => c.estado_cochinera !== 'En Mantenimiento' && c.espacios_libres > 0)
                      .map(c => (
                        <option key={c.id_cochinera} value={c.id_cochinera}>
                          Cochinera #{c.id_cochinera} ({c.espacios_libres} espacios libres)
                        </option>
                      ))
                    }
                  </select>
                </FormField>
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem', marginBottom: '1rem' }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>Registrar ejemplar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
