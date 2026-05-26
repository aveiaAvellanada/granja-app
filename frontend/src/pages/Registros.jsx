import { useEffect, useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { getAlimentacion, registrarAlimentacion, getRevision, registrarRevision, getPesajes, registrarPesaje } from '../api/registros.api.js'
import { getCerdos } from '../api/cerdos.api.js'
import { getInventario, getUnidades } from '../api/inventario.api.js'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ExportButton from '../components/ExportButton'
import { Icon } from '../components/Icon.jsx'

export default function Registros() {
  const { user } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(1) // 1: Alimentación, 2: Revisión, 3: Pesajes
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  
  const [cerdos, setCerdos] = useState([])
  const [inventario, setInventario] = useState([])
  const [unidades, setUnidades] = useState([])

  const { register, handleSubmit, reset, setValue } = useForm()

  useEffect(() => {
    // Handle navigation from Veterinario.jsx
    if (location.state?.tab) {
      setActiveTab(location.state.tab)
      if (location.state.id_cerdo) {
        setModal(location.state.tab === 2 ? 'revision' : null)
      }
    }
  }, [location])

  const loadTabContent = async () => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (activeTab === 1) res = await getAlimentacion()
      else if (activeTab === 2) res = await getRevision()
      else res = await getPesajes()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar registros')
    } finally {
      setLoading(false)
    }
  }

  const loadAuxData = async () => {
    try {
      const [c, i, u] = await Promise.all([
        getCerdos(),
        getInventario(),
        getUnidades()
      ])
      setCerdos(c.data)
      setInventario(i.data)
      setUnidades(u.data)

      // Set pre-selected pig if coming from navigation
      if (location.state?.id_cerdo) {
        setValue('id_cerdo', location.state.id_cerdo)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadTabContent()
  }, [activeTab])

  useEffect(() => {
    loadAuxData()
  }, [])

  const onAlimentacionSubmit = async (formData) => {
    await registrarAlimentacion(formData)
    setModal(null)
    reset()
    loadTabContent()
  }

  const onRevisionSubmit = async (formData) => {
    await registrarRevision(formData)
    setModal(null)
    reset()
    loadTabContent()
  }

  const onPesajeSubmit = async (formData) => {
    await registrarPesaje(formData)
    setModal(null)
    reset()
    loadTabContent()
  }

  const columnsAlimentacion = useMemo(() => [
    { header: 'Fecha y Hora', accessorFn: row => new Date(row.fecha_registro).toLocaleString(), cell: info => <span className="text-muted">{info.getValue()}</span> },
    { header: 'Cerdo', accessorKey: 'cerdo', cell: info => <span className="text-strong">#{info.getValue()}</span> },
    { header: 'Empleado', accessorKey: 'empleado' },
    { header: 'Insumo', accessorKey: 'alimento' },
    { header: 'Cantidad', accessorFn: row => `${row.cantidad_consumida} ${row.unidad}`, cell: info => <span className="text-strong" style={{ color: 'var(--amber)' }}>{info.getValue()}</span> },
    { header: 'Observaciones', accessorKey: 'observaciones', cell: info => <span className="text-muted" style={{ fontSize: '0.85rem' }}>{info.getValue() || '—'}</span> }
  ], [])

  const columnsRevision = useMemo(() => [
    { header: 'Fecha y Hora', accessorFn: row => new Date(row.fecha_registro).toLocaleString(), cell: info => <span className="text-muted">{info.getValue()}</span> },
    { header: 'Cerdo', accessorKey: 'cerdo', cell: info => <span className="text-strong">#{info.getValue()}</span> },
    { header: 'Especialista', accessorKey: 'empleado' },
    { header: 'Diagnóstico', accessorKey: 'diagnostico', cell: info => <span className="text-strong" style={{ color: 'var(--info-ink)' }}>{info.getValue()}</span> },
    { header: 'Medicamento', accessorKey: 'medicamento', cell: info => info.getValue() ? <span className="badge badge-info">{info.getValue()}</span> : <span className="text-muted italic">Ninguno</span> },
    { header: 'Observaciones', accessorKey: 'observaciones', cell: info => <span className="text-muted" style={{ fontSize: '0.85rem' }}>{info.getValue() || '—'}</span> }
  ], [])

  const columnsPesajes = useMemo(() => [
    { header: 'Fecha y Hora', accessorFn: row => new Date(row.fecha_pesaje).toLocaleString(), cell: info => <span className="text-muted">{info.getValue()}</span> },
    { header: 'Cerdo', accessorKey: 'cerdo', cell: info => <span className="text-strong">#{info.getValue()}</span> },
    { header: 'Empleado', accessorKey: 'empleado' },
    { header: 'Peso', accessorKey: 'peso_kg', cell: info => <span className="text-strong" style={{ color: 'var(--green-accent)' }}>{info.getValue()} kg</span> },
    { header: 'Observaciones', accessorKey: 'observaciones', cell: info => <span className="text-muted" style={{ fontSize: '0.85rem' }}>{info.getValue() || '—'}</span> }
  ], [])

  return (
    <div className="page-animate">
      <PageHeader title="Seguimiento Diario" icon={<Icon name="clipboard" size={20} />}>
        <div className="row gap-2">
          <ExportButton data={data} filename={`Registros_Tab${activeTab}`} />
          {activeTab === 1 && <button className="btn btn-primary" onClick={() => setModal('alimentacion')}><Icon name="plus" size={14} /> Alimentación</button>}
          {activeTab === 2 && <button className="btn btn-primary" onClick={() => setModal('revision')}><Icon name="plus" size={14} /> Revisión Médica</button>}
          {activeTab === 3 && <button className="btn btn-primary" onClick={() => setModal('pesaje')}><Icon name="plus" size={14} /> Registrar Peso</button>}
        </div>
      </PageHeader>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 1 ? 'is-active' : ''}`} onClick={() => setActiveTab(1)}>
          <Icon name="box" size={14} /> Alimentación
        </button>
        <button className={`tab-btn ${activeTab === 2 ? 'is-active' : ''}`} onClick={() => setActiveTab(2)}>
          <Icon name="shield" size={14} /> Revisión Médica
        </button>
        <button className={`tab-btn ${activeTab === 3 ? 'is-active' : ''}`} onClick={() => setActiveTab(3)}>
          <Icon name="chart" size={14} /> Control de Pesaje
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Obteniendo registros de bitácora..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadTabContent} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable data={data} columns={
            activeTab === 1 ? columnsAlimentacion : 
            activeTab === 2 ? columnsRevision : 
            columnsPesajes
          } />
        </div>
      )}

      {/* Modal Alimentación */}
      {modal === 'alimentacion' && (
        <Modal title="Nuevo Registro de Alimentación" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onAlimentacionSubmit)}>
            <FormField label="Animal">
              <select className="input" {...register('id_cerdo', { required: true })}>
                <option value="">Seleccionar de la lista...</option>
                {cerdos.map(c => (
                  <option key={c.id_cerdo} value={c.id_cerdo}>#{c.id_cerdo} — {c.raza} — {c.sexo_cerdo}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Responsable">
              <input className="input" value={user?.nombre || ''} readOnly disabled style={{ background: 'var(--surface-sunken)' }} />
            </FormField>
            <FormField label="Alimento / Insumo">
              <select className="input" {...register('id_item', { required: true })}>
                <option value="">Seleccione alimento...</option>
                {inventario.filter(i => (i.id_tipo_item === 1 || i.id_tipo_item === 3) && i.estado_item === 'Disponible').map(i => (
                  <option key={i.id_item} value={i.id_item}>{i.nombre_item} (Stock: {i.cantidad_stock} {i.abreviatura})</option>
                ))}
              </select>
            </FormField>
            <div className="row gap-3">
              <div style={{ flex: 1 }}>
                <FormField label="Cantidad">
                  <input className="input text-mono" type="number" step="0.01" min="0.01" {...register('cantidad', { required: true })} />
                </FormField>
              </div>
              <div style={{ flex: 1 }}>
                <FormField label="Unidad">
                  <select className="input" {...register('id_unidad', { required: true })}>
                    <option value="">Unidad...</option>
                    {unidades.map(u => (
                      <option key={u.id_unidad} value={u.id_unidad}>{u.nombre} ({u.abreviatura})</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>
            <FormField label="Observaciones adicionales">
              <textarea className="input" rows="3" {...register('observaciones')} placeholder="Notas sobre el consumo o comportamiento..." />
            </FormField>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary btn-block">Guardar en Bitácora</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Revisión */}
      {modal === 'revision' && (
        <Modal title="Reporte de Revisión Médica" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onRevisionSubmit)}>
            <FormField label="Animal">
              <select className="input" {...register('id_cerdo', { required: true })}>
                <option value="">Seleccionar animal...</option>
                {cerdos.map(c => (
                  <option key={c.id_cerdo} value={c.id_cerdo}>#{c.id_cerdo} — {c.raza} — {c.sexo_cerdo}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Profesional responsable">
              <input className="input" value={user?.nombre || ''} readOnly disabled style={{ background: 'var(--surface-sunken)' }} />
            </FormField>
            <FormField label="Diagnóstico clínico">
              <textarea className="input" rows="3" {...register('diagnostico', { required: true })} placeholder="Descripción detallada de la condición..." />
            </FormField>
            <FormField label="Suministro de medicamento (Opcional)">
              <select className="input" {...register('id_medicamento')}>
                <option value="">Sin prescripción</option>
                {inventario.filter(i => i.id_tipo_item === 2 && i.estado_item === 'Disponible').map(i => (
                  <option key={i.id_item} value={i.id_item}>{i.nombre_item} (Stock: {i.cantidad_stock} {i.abreviatura})</option>
                ))}
              </select>
            </FormField>
            <FormField label="Notas de seguimiento">
              <textarea className="input" rows={2} {...register('observaciones')} />
            </FormField>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary btn-block">Guardar Ficha Médica</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Pesaje */}
      {modal === 'pesaje' && (
        <Modal title="Registro de Control de Peso" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onPesajeSubmit)}>
            <FormField label="Animal">
              <select className="input" {...register('id_cerdo', { required: true })}>
                <option value="">Seleccionar animal...</option>
                {cerdos.map(c => (
                  <option key={c.id_cerdo} value={c.id_cerdo}>#{c.id_cerdo} — {c.raza} — {c.sexo_cerdo}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Registrado por">
              <input className="input" value={user?.nombre || ''} readOnly disabled style={{ background: 'var(--surface-sunken)' }} />
            </FormField>
            <FormField label="Peso corporal (kg)">
              <input className="input text-mono" type="number" step="0.1" min="0.1" {...register('peso_kg', { required: true })} style={{ fontSize: '1.25rem' }} />
            </FormField>
            <FormField label="Condición física / Notas">
              <textarea className="input" rows="3" {...register('observaciones')} />
            </FormField>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary btn-block">Confirmar Pesaje</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
