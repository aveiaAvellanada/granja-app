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
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField'

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

export default function Registros() {
  const { user } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(1) // 1: Alimentación, 2: Revisión, 3: Pesajes
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
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
        // We'll set the value after cerdos are loaded
      }
    }
  }, [location])

  const loadTabContent = async () => {
    setLoading(true)
    try {
      let res
      if (activeTab === 1) res = await getAlimentacion()
      else if (activeTab === 2) res = await getRevision()
      else res = await getPesajes()
      setData(res.data)
    } catch (err) {
      console.error(err)
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
    { header: 'Fecha', accessorFn: row => new Date(row.fecha_registro).toLocaleString() },
    { header: 'Cerdo', accessorKey: 'cerdo' },
    { header: 'Empleado', accessorKey: 'empleado' },
    { header: 'Alimento', accessorKey: 'alimento' },
    { header: 'Cantidad', accessorFn: row => `${row.cantidad_consumida} ${row.unidad}` },
    { header: 'Observaciones', accessorKey: 'observaciones' }
  ], [])

  const columnsRevision = useMemo(() => [
    { header: 'Fecha', accessorFn: row => new Date(row.fecha_registro).toLocaleString() },
    { header: 'Cerdo', accessorKey: 'cerdo' },
    { header: 'Empleado', accessorKey: 'empleado' },
    { header: 'Diagnóstico', accessorKey: 'diagnostico' },
    { header: 'Medicamento', accessorKey: 'medicamento', cell: info => info.getValue() || '—' },
    { header: 'Observaciones', accessorKey: 'observaciones' }
  ], [])

  const columnsPesajes = useMemo(() => [
    { header: 'Fecha', accessorFn: row => new Date(row.fecha_pesaje).toLocaleString() },
    { header: 'Cerdo', accessorKey: 'cerdo' },
    { header: 'Empleado', accessorKey: 'empleado' },
    { header: 'Peso (kg)', accessorKey: 'peso_kg' },
    { header: 'Observaciones', accessorKey: 'observaciones' }
  ], [])

  return (
    <div>
      <PageHeader title="Registros Operativos">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 1 && <button style={btnPrimary} onClick={() => setModal('alimentacion')}>+ Registrar alimentación</button>}
          {activeTab === 2 && <button style={btnPrimary} onClick={() => setModal('revision')}>+ Registrar revisión</button>}
          {activeTab === 3 && <button style={btnPrimary} onClick={() => setModal('pesaje')}>+ Registrar pesaje</button>}
        </div>
      </PageHeader>

      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <button style={tabButtonStyle(activeTab === 1)} onClick={() => setActiveTab(1)}>Alimentación</button>
        <button style={tabButtonStyle(activeTab === 2)} onClick={() => setActiveTab(2)}>Revisión Médica</button>
        <button style={tabButtonStyle(activeTab === 3)} onClick={() => setActiveTab(3)}>Pesajes</button>
      </div>

      <div style={card}>
        <DataTable data={data} columns={
          activeTab === 1 ? columnsAlimentacion : 
          activeTab === 2 ? columnsRevision : 
          columnsPesajes
        } />
      </div>

      {/* Modal Alimentación */}
      {modal === 'alimentacion' && (
        <Modal title="Registrar Alimentación" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onAlimentacionSubmit)}>
            <FormField label="Cerdo">
              <select style={inputStyle} {...register('id_cerdo', { required: true })}>
                <option value="">Seleccione un cerdo...</option>
                {cerdos.map(c => (
                  <option key={c.id_cerdo} value={c.id_cerdo}>{c.id_cerdo} - {c.raza} - {c.sexo_cerdo}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Empleado">
              <input style={inputStyle} value={user?.nombre || ''} readOnly disabled />
            </FormField>
            <FormField label="Alimento">
              <select style={inputStyle} {...register('id_item', { required: true })}>
                <option value="">Seleccione alimento...</option>
                {inventario.filter(i => (i.id_tipo_item === 1 || i.id_tipo_item === 3) && i.estado_item === 'Disponible').map(i => (
                  <option key={i.id_item} value={i.id_item}>{i.nombre_item} (Stock: {i.cantidad_stock} {i.abreviatura})</option>
                ))}
              </select>
            </FormField>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <FormField label="Cantidad">
                  <input style={inputStyle} type="number" step="0.01" min="0.01" {...register('cantidad', { required: true })} />
                </FormField>
              </div>
              <div style={{ flex: 1 }}>
                <FormField label="Unidad">
                  <select style={inputStyle} {...register('id_unidad', { required: true })}>
                    <option value="">Unidad...</option>
                    {unidades.map(u => (
                      <option key={u.id_unidad} value={u.id_unidad}>{u.nombre} ({u.abreviatura})</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>
            <FormField label="Observaciones">
              <textarea style={inputStyle} rows="3" {...register('observaciones')} />
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Guardar Registro</button>
          </form>
        </Modal>
      )}

      {/* Modal Revisión */}
      {modal === 'revision' && (
        <Modal title="Registrar Revisión Médica" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onRevisionSubmit)}>
            <FormField label="Cerdo">
              <select style={inputStyle} {...register('id_cerdo', { required: true })}>
                <option value="">Seleccione un cerdo...</option>
                {cerdos.map(c => (
                  <option key={c.id_cerdo} value={c.id_cerdo}>{c.id_cerdo} - {c.raza} - {c.sexo_cerdo}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Empleado">
              <input style={inputStyle} value={user?.nombre || ''} readOnly disabled />
            </FormField>
            <FormField label="Diagnóstico">
              <textarea style={inputStyle} rows="3" {...register('diagnostico', { required: true })} />
            </FormField>
            <FormField label="Medicamento (Opcional)">
              <select style={inputStyle} {...register('id_medicamento')}>
                <option value="">Sin medicamento</option>
                {inventario.filter(i => i.id_tipo_item === 2 && i.estado_item === 'Disponible').map(i => (
                  <option key={i.id_item} value={i.id_item}>{i.nombre_item} (Stock: {i.cantidad_stock} {i.abreviatura})</option>
                ))}
              </select>
            </FormField>
            <FormField label="Observaciones">
              <textarea style={inputStyle} rows="2" {...register('observaciones')} />
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Guardar Registro</button>
          </form>
        </Modal>
      )}

      {/* Modal Pesaje */}
      {modal === 'pesaje' && (
        <Modal title="Registrar Pesaje" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onPesajeSubmit)}>
            <FormField label="Cerdo">
              <select style={inputStyle} {...register('id_cerdo', { required: true })}>
                <option value="">Seleccione un cerdo...</option>
                {cerdos.map(c => (
                  <option key={c.id_cerdo} value={c.id_cerdo}>{c.id_cerdo} - {c.raza} - {c.sexo_cerdo}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Empleado">
              <input style={inputStyle} value={user?.nombre || ''} readOnly disabled />
            </FormField>
            <FormField label="Peso (kg)">
              <input style={inputStyle} type="number" step="0.01" min="0.01" {...register('peso_kg', { required: true })} />
            </FormField>
            <FormField label="Observaciones">
              <textarea style={inputStyle} rows="3" {...register('observaciones')} />
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Guardar Pesaje</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
