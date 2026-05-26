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
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

export default function Cochineras() {
  const { user } = useAuth()
  const { id: urlId } = useParams()
  const [cochineras, setCochineras] = useState([])
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
    try {
      const res = await getCochineras()
      setCochineras(res.data)
      
      if (urlId && !selectedCochinera) {
        const found = res.data.find(c => c.id_cochinera === parseInt(urlId))
        if (found) setSelectedCochinera(found)
      }
    } catch (err) {
      console.error(err)
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

  const totalCochineras = cochineras.length
  const totalAnimales = cochineras.reduce((acc, c) => acc + Number(c.ocupacion_actual || 0), 0)
  const totalLibres = cochineras.reduce((acc, c) => acc + Number(c.espacios_libres ?? c.capacidad_max), 0)

  // --- DRAWER STATS ---
  const machosCount = cerdosData.filter(c => c.sexo_cerdo === 'Macho').length
  const hembrasCount = cerdosData.filter(c => c.sexo_cerdo === 'Hembra').length
  const pieData = [
    { name: 'Machos', value: machosCount },
    { name: 'Hembras', value: hembrasCount }
  ]
  const pieColors = ['#3b82f6', '#ec4899']

  const avgWeight = cerdosData.length > 0 
    ? (cerdosData.reduce((acc, c) => acc + (Number(c.ultimo_peso_kg) || 0), 0) / cerdosData.filter(c => c.ultimo_peso_kg).length || 0).toFixed(1)
    : 0

  const oldest = cerdosData.length > 0 ? Math.max(...cerdosData.map(c => c.edad_dias || 0)) : 0
  const youngest = cerdosData.length > 0 ? Math.min(...cerdosData.map(c => c.edad_dias || 0)) : 0

  const columnsCerdos = useMemo(() => [
    { header: 'ID', accessorKey: 'id_cerdo', cell: info => `#${info.getValue()}` },
    { header: 'Sexo', accessorKey: 'sexo_cerdo' },
    { header: 'Raza', accessorKey: 'raza', cell: info => info.getValue() ?? '—' },
    { header: 'Edad (días)', accessorKey: 'edad_dias', cell: info => info.getValue() ?? '—' },
    { header: 'Últ. Peso (kg)', accessorKey: 'ultimo_peso_kg', cell: info => info.getValue() ?? '—' },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: info => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/cerdos/${info.row.original.id_cerdo}`} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}>Ficha</Link>
          <button 
            onClick={() => setTransferPig(info.row.original)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#6366f1' }}
            title="Trasladar cerdo"
          >
            ⇄
          </button>
        </div>
      )
    }
  ], [])

  return (
    <div>
      <style>{`
        .cochinera-card {
          background: #fff;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .cochinera-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .grid-container {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(1, 1fr);
        }
        @media (min-width: 640px) { .grid-container { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .grid-container { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1280px) { .grid-container { grid-template-columns: repeat(4, 1fr); } }
        
        .progress-bar-bg { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 0.75rem 0; }
        .progress-bar-fill { height: 100%; transition: width 0.3s ease; }
      `}</style>

      <PageHeader title="Cochineras">
        {user?.rol === 'administrador' && (
          <button style={btnPrimary} onClick={() => setShowCreateModal(true)}>+ Nueva cochinera</button>
        )}
      </PageHeader>

      {/* GLOBAL STATS & SEARCH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', color: '#4b5563' }}>
          <div><strong>{totalCochineras}</strong> cochineras</div>
          <div style={{ borderLeft: '1px solid #d1d5db', paddingLeft: '1.5rem' }}><strong>{totalAnimales}</strong> animales en total</div>
          <div style={{ borderLeft: '1px solid #d1d5db', paddingLeft: '1.5rem' }}><strong>{totalLibres}</strong> espacios libres</div>
        </div>
        <input 
          type="text" 
          placeholder="Buscar por # cochinera..." 
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value.replace(/\D/g, ''))}
          style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #d1d5db', width: '250px' }}
        />
      </div>

      {/* GRID */}
      <div className="grid-container">
        {filteredCochineras.map(c => {
          const cap = Number(c.capacidad_max || 1)
          const ocu = Number(c.ocupacion_actual || 0)
          const pct = ocu / cap
          const isRed = pct > 0.9 || c.estado_cochinera === 'Llena'
          const isYellow = pct >= 0.7 && !isRed
          const barColor = isRed ? '#dc2626' : (isYellow ? '#f59e0b' : '#10b981')
          
          const bgBadge = c.estado_cochinera === 'Disponible' ? '#dcfce7' : (c.estado_cochinera === 'Llena' ? '#fee2e2' : '#fef3c7')
          const fgBadge = c.estado_cochinera === 'Disponible' ? '#166534' : (c.estado_cochinera === 'Llena' ? '#991b1b' : '#92400e')

          return (
            <div key={c.id_cochinera} className="cochinera-card" onClick={() => setSelectedCochinera(c)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>🛖</div>
                <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: bgBadge, color: fgBadge }}>
                  {c.estado_cochinera}
                </span>
              </div>
              
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: '#111827' }}>Cochinera #{c.id_cochinera}</h3>
              
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${Math.min(pct * 100, 100)}%`, background: barColor }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                <span>Ocupación: {ocu} / {cap}</span>
                <span>Libres: {c.espacios_libres ?? cap}</span>
              </div>

              <button 
                style={{ marginTop: 'auto', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: '4px', color: '#374151', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={(e) => { e.stopPropagation(); setSelectedCochinera(c); }}
              >
                Ver cerdos
              </button>
            </div>
          )
        })}
        {filteredCochineras.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No se encontraron cochineras.</p>
        )}
      </div>

      {/* DRAWER / MODAL DEL DETALLE */}
      {selectedCochinera && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '800px', height: '100vh', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', animation: 'slideIn 0.3s forwards' }}>
            <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.75rem' }}>Cochinera #{selectedCochinera.id_cochinera}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: '#4b5563' }}>
                  <span>Capacidad: <strong>{selectedCochinera.capacidad_max}</strong></span>
                  <span>Ocupación: <strong>{selectedCochinera.ocupacion_actual || 0}</strong></span>
                  <span>Libres: <strong>{selectedCochinera.espacios_libres ?? selectedCochinera.capacidad_max}</strong></span>
                </div>
              </div>
              <button onClick={() => setSelectedCochinera(null)} style={{ background: 'transparent', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: '#fff', border: '1px solid #e5e7eb', padding: '1rem 1.5rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Estado Actual:</span>
                  <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.9rem', fontWeight: 600, 
                    background: selectedCochinera.estado_cochinera === 'Disponible' ? '#dcfce7' : (selectedCochinera.estado_cochinera === 'Llena' ? '#fee2e2' : '#fef3c7'), 
                    color: selectedCochinera.estado_cochinera === 'Disponible' ? '#166534' : (selectedCochinera.estado_cochinera === 'Llena' ? '#991b1b' : '#92400e') }}>
                    {selectedCochinera.estado_cochinera}
                  </span>
                </div>
                <select 
                  value={selectedCochinera.estado_cochinera}
                  onChange={(e) => setConfirmToggle({ id: selectedCochinera.id_cochinera, estado: e.target.value })}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Llena">Llena</option>
                  <option value="En Mantenimiento">En Mantenimiento</option>
                </select>
              </div>

              {cerdosData.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Distribución por Sexo</h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                        <span style={{ color: pieColors[0] }}>● Machos: {machosCount}</span>
                        <span style={{ color: pieColors[1] }}>● Hembras: {hembrasCount}</span>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                      <h4 style={{ margin: 0, color: '#374151' }}>Estadísticas Adicionales</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ color: '#6b7280' }}>Peso promedio:</span>
                        <span style={{ fontWeight: 700, color: '#111827' }}>{avgWeight} kg</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ color: '#6b7280' }}>Cerdo más antiguo:</span>
                        <span style={{ fontWeight: 700, color: '#111827' }}>{oldest} días</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Cerdo más joven:</span>
                        <span style={{ fontWeight: 700, color: '#111827' }}>{youngest} días</span>
                      </div>
                    </div>
                  </div>

                  <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#111827' }}>Cerdos en esta cochinera</h3>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                    <DataTable data={cerdosData} columns={columnsCerdos} />
                  </div>
                </>
              ) : (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐖</div>
                  <h3 style={{ color: '#374151', margin: '0 0 0.5rem 0' }}>Esta cochinera está vacía</h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>No hay cerdos activos asignados a esta instalación.</p>
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
            <FormField label="Capacidad Máxima"><input style={inputStyle} type="number" {...register('capacidad_max', { required: true })} /></FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Crear</button>
          </form>
        </Modal>
      )}

      {/* TRANSFER MODAL */}
      {transferPig && (
        <Modal title={`Trasladar Cerdo #${transferPig.id_cerdo}`} onClose={() => setTransferPig(null)}>
          <form onSubmit={transferForm.handleSubmit(onTrasladarSubmit)}>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Cochinera actual:</p>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Cochinera #{selectedCochinera?.id_cochinera}</p>
            </div>
            <FormField label="Cochinera destino">
              <select style={inputStyle} {...transferForm.register('id_cochinera_destino', { required: true })}>
                <option value="">Seleccione destino...</option>
                {cochineras
                  .filter(c => c.estado_cochinera !== 'En Mantenimiento' && c.espacios_libres > 0 && c.id_cochinera !== selectedCochinera?.id_cochinera)
                  .map(c => (
                    <option key={c.id_cochinera} value={c.id_cochinera}>
                      Cochinera #{c.id_cochinera} ({c.espacios_libres} espacios libres)
                    </option>
                  ))
                }
              </select>
            </FormField>
            <FormField label="Motivo">
              <textarea style={inputStyle} rows={3} {...transferForm.register('motivo')} />
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%', marginTop: '1rem' }}>Siguiente</button>
          </form>
        </Modal>
      )}

      <ConfirmModal
        isOpen={!!confirmToggle}
        title="Cambiar estado"
        message={`¿Seguro que deseas cambiar el estado de la cochinera #${selectedCochinera?.id_cochinera} a "${confirmToggle?.estado}"?`}
        confirmColor="blue"
        onConfirm={handleToggle}
        onCancel={() => setConfirmToggle(null)}
      />

      <ConfirmModal
        isOpen={!!confirmTransfer}
        title="Confirmar traslado"
        message={`¿Trasladar cerdo #${transferPig?.id_cerdo} de Cochinera #${selectedCochinera?.id_cochinera} a Cochinera #${confirmTransfer?.id_cochinera_destino}?`}
        confirmColor="blue"
        onConfirm={execTraslado}
        onCancel={() => setConfirmTransfer(null)}
      />
    </div>
  )
}
