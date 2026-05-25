import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getCochineras, createCochinera, updateCochinera } from '../api/cochineras.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'

function ocupacionColor(ocupacion, capacidad) {
  if (!capacidad) return '#e5e7eb'
  const pct = ocupacion / capacidad
  if (pct >= 0.9) return '#fee2e2'
  if (pct >= 0.6) return '#fef3c7'
  return '#dcfce7'
}

export default function Cochineras() {
  const [cochineras, setCochineras] = useState([])
  const [showModal, setShowModal] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    getCochineras().then((r) => setCochineras(r.data)).catch(() => {})
  }, [])

  async function onSubmit(data) {
    await createCochinera(data)
    reset()
    setShowModal(false)
    getCochineras().then((r) => setCochineras(r.data))
  }

  async function toggleEstado(c) {
    const nuevoEstado = c.estado === 'activa' ? 'inactiva' : 'activa'
    await updateCochinera(c.id_cochinera, { estado: nuevoEstado })
    getCochineras().then((r) => setCochineras(r.data))
  }

  return (
    <div>
      <PageHeader title="Cochineras">
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Nueva cochinera</button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {cochineras.map((c) => (
          <div
            key={c.id_cochinera}
            style={{ ...card, margin: 0, borderLeft: `4px solid #2563eb`, background: ocupacionColor(c.ocupacion_actual ?? c.total_cerdos ?? 0, c.capacidad) }}
          >
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{c.nombre}</div>
            <div style={{ fontSize: '0.85rem', color: '#374151' }}>
              {c.ocupacion_actual ?? c.total_cerdos ?? 0} / {c.capacidad} cerdos
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>{c.tipo}</div>
            <button
              onClick={() => toggleEstado(c)}
              style={{ marginTop: '0.75rem', fontSize: '0.78rem', padding: '3px 10px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff' }}
            >
              {c.estado === 'activa' ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Nueva cochinera" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Nombre"><input style={inputStyle} {...register('nombre', { required: true })} /></FormField>
            <FormField label="Capacidad"><input style={inputStyle} type="number" {...register('capacidad', { required: true })} /></FormField>
            <FormField label="Tipo"><input style={inputStyle} {...register('tipo')} /></FormField>
            <FormField label="Descripción"><input style={inputStyle} {...register('descripcion')} /></FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Crear</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
