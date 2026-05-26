import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getCochineras, createCochinera, updateCochinera, getCochineraCerdos } from '../api/cochineras.api.js'
import { trasladarCerdo } from '../api/cerdos.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import Breadcrumb from '../components/Breadcrumb'
import { Icon } from '../components/Icon.jsx'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

export default function Cochineras() {
  const { user } = useAuth()
  const { id: urlId } = useParams()
  const [cochineras, setCochineras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState(null)
  const [selectedCochinera, setSelectedCochinera] = useState(null)
  const [cerdosData, setCerdosData] = useState([])
  
  // Transfer Modal
  const [transferPig, setTransferPig] = useState(null)
  const [confirmTransfer, setConfirmTransfer] = useState(null)
  const transferForm = useForm()

  const { register, handleSubmit, reset } = useForm()

  const reload = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCochineras()
      setCochineras(res.data)
      
      if (urlId && !selectedCochinera) {
        const found = res.data.find(c => c.id_cochinera === parseInt(urlId))
        if (found) setSelectedCochinera(found)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar cochineras')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [urlId])

  useEffect(() => {
    if (selectedCochinera) {
      getCochineraCerdos(selectedCochinera.id_cochinera).then(r => setCerdosData(r.data)).catch(() => {})
    }
  }, [selectedCochinera])

  async function onSubmit(data) {
    await createCochinera(data)
    reset()
    setShowCreateModal(false)
    reload()
  }

  async function handleToggle() {
    const { id, estado } = confirmToggle
    await updateCochinera(id, { estado_cochinera: estado })
    setConfirmToggle(null)
    reload()
    if (selectedCochinera && selectedCochinera.id_cochinera === id) {
      setSelectedCochinera(prev => ({ ...prev, estado_cochinera: estado }))
    }
  }

  async function onTrasladarSubmit(data) {
    setConfirmTransfer(data)
  }

  async function execTraslado() {
    await trasladarCerdo(transferPig.id_cerdo, confirmTransfer)
    setTransferPig(null)
    setConfirmTransfer(null)
    transferForm.reset()
    reload()
    // Refresh cerdos list of current cochinera
    if (selectedCochinera) {
      getCochineraCerdos(selectedCochinera.id_cochinera).then(r => setCerdosData(r.data)).catch(() => {})
    }
  }

  const filteredCochineras = useMemo(() => {
    if (!searchFilter) return cochineras
    return cochineras.filter(c => c.id_cochinera.toString().includes(searchFilter))
  }, [cochineras, searchFilter])

  // --- DRAWER STATS ---
  const machosCount = Array.isArray(cerdosData) ? cerdosData.filter(c => c.sexo_cerdo === 'Macho').length : 0
  const hembrasCount = Array.isArray(cerdosData) ? cerdosData.filter(c => c.sexo_cerdo === 'Hembra').length : 0
  const pieData = [
    { name: 'Machos', value: machosCount },
    { name: 'Hembras', value: hembrasCount }
  ]
  const pieColors = ['var(--info)', '#EC4899']

  const pigsWithWeight = Array.isArray(cerdosData) ? cerdosData.filter(c => c.ultimo_peso_kg) : []
  const avgWeight = pigsWithWeight.length > 0 
    ? (pigsWithWeight.reduce((acc, c) => acc + (Number(c.ultimo_peso_kg) || 0), 0) / pigsWithWeight.length).toFixed(1)
    : 0

  const ages = Array.isArray(cerdosData) && cerdosData.length > 0 ? cerdosData.map(c => c.edad_dias || 0) : []
  const oldest = ages.length > 0 ? Math.max(...ages) : 0
  const youngest = ages.length > 0 ? Math.min(...ages) : 0

  const columnsCerdos = useMemo(() => [
    { header: 'ID', accessorKey: 'id_cerdo', cell: info => <span className="text-mono">#{info.getValue()}</span> },
    { header: 'Sexo', accessorKey: 'sexo_cerdo' },
    { header: 'Raza', accessorKey: 'raza', cell: info => info.getValue() ?? '—' },
    { header: 'Edad (días)', accessorKey: 'edad_dias', cell: info => info.getValue() ?? '—' },
    { header: 'Últ. Peso (kg)', accessorKey: 'ultimo_peso_kg', cell: info => <span className="text-strong">{info.getValue() ?? '—'}</span> },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: info => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={"/cerdos/" + info.row.original.id_cerdo} className="btn btn-ghost btn-sm" style={{ color: 'var(--green)' }}>Ver</Link>
          <button 
            onClick={() => setTransferPig(info.row.original)}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--info)' }}
            title="Trasladar cerdo"
          >
            <Icon name="arrow-right" size={12} />
          </button>
        </div>
      )
    }
  ], [])

  if (loading) return <LoadingSpinner message="Cargando cochineras..." />
  if (error) return <ErrorMessage message={error} onRetry={reload} />

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Cochineras', path: '/cochineras' }
  ]
  if (selectedCochinera) {
    breadcrumbItems.push({ label: `Cochinera #${selectedCochinera.id_cochinera}`, path: `/cochineras/${selectedCochinera.id_cochinera}` })
  }

  const totalAnimales = Array.isArray(cochineras) ? cochineras.reduce((acc, c) => acc + Number(c.ocupacion_actual || 0), 0) : 0
  const totalLibres = Array.isArray(cochineras) ? cochineras.reduce((acc, c) => acc + Number(c.espacios_libres ?? c.capacidad_max), 0) : 0

  return (
    <div className="page-animate">
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="Cochineras" icon={<Icon name="barn" size={20} />}>
        {user?.rol === 'administrador' && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Icon name="plus" size={14} /> Nueva cochinera
          </button>
        )}
      </PageHeader>

      {/* GLOBAL STATS & SEARCH */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div className="col">
            <span className="eyebrow">Instalaciones</span>
            <span className="text-strong" style={{ fontSize: '1.1rem' }}>{cochineras.length} <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Unidades</span></span>
          </div>
          <div style={{ width: 1, height: 28, background: 'var(--border-soft)' }} />
          <div className="col">
            <span className="eyebrow">Población</span>
            <span className="text-strong" style={{ fontSize: '1.1rem' }}>{totalAnimales} <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Cerdos</span></span>
          </div>
          <div style={{ width: 1, height: 28, background: 'var(--border-soft)' }} />
          <div className="col">
            <span className="eyebrow">Disponibilidad</span>
            <span className="text-strong" style={{ fontSize: '1.1rem', color: 'var(--green-accent)' }}>{totalLibres} <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Vacantes</span></span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por #" 
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value.replace(/\D/g, ''))}
            className="input"
            style={{ width: '180px', paddingLeft: 34 }}
          />
        </div>
      </div>

      {/* GRID */}
      <div style={gridContainer}>
        {Array.isArray(filteredCochineras) && filteredCochineras.map(c => {
          const cap = Number(c.capacidad_max || 1)
          const ocu = Number(c.ocupacion_actual || 0)
          const pct = Math.min((ocu / cap) * 100, 100)
          
          let statusClass = 'badge-success'
          let barColor = 'var(--green-accent)'
          if (c.estado_cochinera === 'Llena' || pct > 90) {
            statusClass = 'badge-danger'
            barColor = 'var(--rust)'
          } else if (c.estado_cochinera === 'En Mantenimiento' || pct >= 70) {
            statusClass = 'badge-amber'
            barColor = 'var(--amber)'
          }

          return (
            <div key={c.id_cochinera} className="card card-tight" style={cochCard} onClick={() => setSelectedCochinera(c)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={iconBox}>
                  <Icon name="barn" size={18} color="var(--green)" />
                </div>
                <span className={`badge ${statusClass}`}>
                  {c.estado_cochinera}
                </span>
              </div>
              
              <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>Cochinera #{c.id_cochinera}</h3>
              
              <div style={progressBg}>
                <div style={{ ...progressFill, width: `${pct}%`, background: barColor }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '1.25rem' }}>
                <span className="text-muted">Carga: <span className="text-strong">{ocu} / {cap}</span></span>
                <span className="text-muted">Libres: <span className="text-strong">{c.espacios_libres ?? cap}</span></span>
              </div>

              <button className="btn btn-secondary btn-sm btn-block">
                Ver detalle
              </button>
            </div>
          )
        })}
        {(!Array.isArray(filteredCochineras) || filteredCochineras.length === 0) && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0' }}>
            <Icon name="alert" size={32} color="var(--ink-muted)" />
            <p style={{ marginTop: '1rem', color: 'var(--ink-3)' }}>No se encontraron cochineras que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>

      {/* DRAWER / MODAL DEL DETALLE */}
      {selectedCochinera && (
        <div style={overlay} onClick={() => setSelectedCochinera(null)}>
          <div style={drawer} onClick={e => e.stopPropagation()}>
            
            <div style={drawerHead}>
              <div className="col">
                <div className="row-center gap-2">
                  <h2 style={{ fontSize: '1.5rem' }}>Cochinera #{selectedCochinera.id_cochinera}</h2>
                  <span className={`badge ${selectedCochinera.estado_cochinera === 'Disponible' ? 'badge-success' : (selectedCochinera.estado_cochinera === 'Llena' ? 'badge-danger' : 'badge-amber')}`}>
                    {selectedCochinera.estado_cochinera}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: 6 }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>Capacidad: <strong className="text-strong">{selectedCochinera.capacidad_max}</strong></span>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>Ocupación: <strong className="text-strong">{selectedCochinera.ocupacion_actual || 0}</strong></span>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>Libres: <strong className="text-strong" style={{ color: 'var(--green-accent)' }}>{selectedCochinera.espacios_libres ?? selectedCochinera.capacidad_max}</strong></span>
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelectedCochinera(null)} style={{ padding: 8 }}>
                <Icon name="logout" size={20} />
              </button>
            </div>

            <div style={drawerBody} className="scroll-dark">
              
              <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="row-center gap-3">
                  <span className="text-strong">Gestión de estado:</span>
                  <select 
                    className="input"
                    value={selectedCochinera.estado_cochinera}
                    onChange={(e) => setConfirmToggle({ id: selectedCochinera.id_cochinera, estado: e.target.value })}
                    style={{ width: '180px' }}
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Llena">Llena</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                  </select>
                </div>
                <p className="text-muted" style={{ fontSize: '0.8rem', maxWidth: '300px', textAlign: 'right' }}>
                  Afecta la disponibilidad para traslados y nuevos registros.
                </p>
              </div>

              {Array.isArray(cerdosData) && cerdosData.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="card col" style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <h4 className="section-title"><span className="dot" />Sexo</h4>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value">
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', marginTop: 10 }}>
                        <span className="row-center gap-1"><span className="status-dot" style={{ background: pieColors[0], width: 6, height: 6 }} /> Machos: {machosCount}</span>
                        <span className="row-center gap-1"><span className="status-dot" style={{ background: pieColors[1], width: 6, height: 6 }} /> Hembras: {hembrasCount}</span>
                      </div>
                    </div>

                    <div className="card col" style={{ justifyContent: 'center', gap: '12px' }}>
                      <h4 className="section-title"><span className="dot" />Estadísticas del lote</h4>
                      <div className="row-between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-soft)' }}>
                        <span className="text-muted">Peso promedio:</span>
                        <span className="text-strong">{avgWeight} kg</span>
                      </div>
                      <div className="row-between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-soft)' }}>
                        <span className="text-muted">Cerdo más antiguo:</span>
                        <span className="text-strong">{oldest} días</span>
                      </div>
                      <div className="row-between">
                        <span className="text-muted">Cerdo más joven:</span>
                        <span className="text-strong">{youngest} días</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="section-title"><span className="dot" />Población actual</h3>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <DataTable data={cerdosData} columns={columnsCerdos} />
                  </div>
                </>
              ) : (
                <div style={emptyBox}>
                  <div style={{ fontSize: '3rem', marginBottom: '1.25rem', opacity: 0.5 }}>🐖</div>
                  <h3 style={{ color: 'var(--ink)', marginBottom: '8px' }}>Cochinera actualmente vacía</h3>
                  <p className="text-muted">No hay cerdos activos asignados a esta instalación en este momento.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <Modal title="Nueva cochinera" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Capacidad Máxima (Cerdos)">
              <input className="input" type="number" {...register('capacidad_max', { required: true })} placeholder="Ej: 20" />
            </FormField>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary btn-block">Crear instalación</button>
            </div>
          </form>
        </Modal>
      )}

      {/* TRANSFER MODAL */}
      {transferPig && (
        <Modal title={`Trasladar Cerdo #${transferPig.id_cerdo}`} onClose={() => setTransferPig(null)}>
          <form onSubmit={transferForm.handleSubmit(onTrasladarSubmit)}>
            <div className="card-accent card-tight" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={iconBoxSmall}>
                <Icon name="barn" size={14} color="var(--green)" />
              </div>
              <div>
                <div className="eyebrow">Origen actual</div>
                <div className="text-strong">Cochinera #{selectedCochinera?.id_cochinera}</div>
              </div>
            </div>
            
            <FormField label="Instalación de destino">
              <select className="input" {...transferForm.register('id_cochinera_destino', { required: true })}>
                <option value="">Seleccionar cochinera...</option>
                {Array.isArray(cochineras) && cochineras
                  .filter(c => c.estado_cochinera !== 'En Mantenimiento' && c.espacios_libres > 0 && c.id_cochinera !== selectedCochinera?.id_cochinera)
                  .map(c => (
                    <option key={c.id_cochinera} value={c.id_cochinera}>
                      Cochinera #{c.id_cochinera} ({c.espacios_libres} disponibles)
                    </option>
                  ))
                }
              </select>
            </FormField>
            
            <FormField label="Justificación o motivo">
              <textarea className="input" rows={3} {...transferForm.register('motivo')} placeholder="Ej: Separación por tamaño, control médico..." />
            </FormField>
            
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary btn-block">Continuar traslado</button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmModal
        isOpen={!!confirmToggle}
        title="Cambiar estado"
        message={`¿Seguro que deseas marcar la cochinera #${selectedCochinera?.id_cochinera} como "${confirmToggle?.estado}"?`}
        confirmColor="blue"
        onConfirm={handleToggle}
        onCancel={() => setConfirmToggle(null)}
      />

      <ConfirmModal
        isOpen={!!confirmTransfer}
        title="Confirmar traslado"
        message={`¿Trasladar cerdo #${transferPig?.id_cerdo} a la Cochinera #${confirmTransfer?.id_cochinera_destino}?`}
        confirmColor="blue"
        onConfirm={execTraslado}
        onCancel={() => setConfirmTransfer(null)}
      />
    </div>
  )
}

/* ── Redesigned styles ───────────────────────────────────────── */

const gridContainer = {
  display: 'grid',
  gap: '1.25rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
}

const cochCard = {
  cursor: 'pointer',
  transition: 'all var(--dur-base) var(--ease-out)',
}

const iconBox = {
  width: 42,
  height: 42,
  borderRadius: 'var(--r-md)',
  background: 'var(--green-soft)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const iconBoxSmall = {
  width: 32,
  height: 32,
  borderRadius: 'var(--r-sm)',
  background: 'var(--green-soft)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const progressBg = {
  width: '100%',
  height: 6,
  background: 'var(--canvas-deep)',
  borderRadius: 99,
  overflow: 'hidden',
  margin: '1rem 0 0.5rem',
}

const progressFill = {
  height: '100%',
  transition: 'width 0.6s var(--ease-out)',
}

const overlay = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(11, 30, 19, 0.4)',
  backdropFilter: 'blur(4px)',
  zIndex: 100,
  display: 'flex',
  justifyContent: 'flex-end',
  animation: 'overlayIn var(--dur-base) var(--ease-out) both',
}

const drawer = {
  background: 'var(--canvas)',
  width: '100%',
  maxWidth: '720px',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 'var(--shadow-xl)',
  animation: 'drawerIn var(--dur-slow) var(--ease-out) both',
}

const drawerHead = {
  padding: '1.5rem 2rem',
  background: 'var(--surface)',
  borderBottom: '1px solid var(--border-soft)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
}

const drawerBody = {
  padding: '2rem',
  overflowY: 'auto',
  flex: 1,
}

const emptyBox = {
  padding: '4rem 2rem',
  textAlign: 'center',
  background: 'var(--surface-2)',
  borderRadius: 'var(--r-lg)',
  border: '2px dashed var(--border)',
}
