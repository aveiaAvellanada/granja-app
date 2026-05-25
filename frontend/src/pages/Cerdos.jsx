import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { getCerdos, registrarCerdo } from '../api/cerdos.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'

export default function Cerdos() {
  const [cerdos, setCerdos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getCerdos().then((r) => setCerdos(r.data)).catch(() => {})
  }, [])

  async function onSubmit(data) {
    try {
      await registrarCerdo(data)
      reset()
      setShowModal(false)
      getCerdos().then((r) => setCerdos(r.data))
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar')
    }
  }

  return (
    <div>
      <PageHeader title="Cerdos">
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Registrar cerdo</button>
      </PageHeader>

      <div style={card}>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Sexo</th><th>Raza</th><th>Edad</th><th>Peso (kg)</th><th>Cochinera</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cerdos.map((c) => (
              <tr key={c.id_cerdo}>
                <td>{c.id_cerdo}</td>
                <td>{c.sexo_cerdo}</td>
                <td>{c.raza ?? '—'}</td>
                <td>{c.edad_dias ?? '—'} días</td>
                <td>{c.ultimo_peso_kg ?? '—'}</td>
                <td>{c.id_cochinera_actual ?? '—'}</td>
                <td><Link to={`/cerdos/${c.id_cerdo}`} style={{ color: '#2563eb', fontWeight: 600 }}>Ver</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {cerdos.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af' }}>No hay cerdos activos.</p>}
      </div>

      {showModal && (
        <Modal title="Registrar cerdo" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Sexo" error={errors.sexo?.message}>
              <select style={inputStyle} {...register('sexo', { required: 'Requerido' })}>
                <option value="">Seleccione...</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </FormField>
            <FormField label="ID Raza" error={errors.id_raza?.message}>
              <input style={inputStyle} type="number" {...register('id_raza', { required: 'Requerido' })} />
            </FormField>
            <FormField label="Fecha de nacimiento">
              <input style={inputStyle} type="date" {...register('fecha_nac')} />
            </FormField>
            <FormField label="ID Padre (opcional)">
              <input style={inputStyle} type="number" {...register('id_padre')} />
            </FormField>
            <FormField label="ID Madre (opcional)">
              <input style={inputStyle} type="number" {...register('id_madre')} />
            </FormField>
            <FormField label="ID Cochinera" error={errors.id_cochinera?.message}>
              <input style={inputStyle} type="number" {...register('id_cochinera', { required: 'Requerido' })} />
            </FormField>
            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Registrar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
