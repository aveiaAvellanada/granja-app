import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { getCerdos, registrarCerdo } from '../api/cerdos.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'

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

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'id_cerdo' },
    { header: 'Sexo', accessorKey: 'sexo_cerdo' },
    { header: 'Raza', accessorKey: 'raza', cell: info => info.getValue() ?? '—' },
    { header: 'Edad', accessorKey: 'edad_dias', cell: info => info.getValue() != null ? `${info.getValue()} días` : '—' },
    { header: 'Peso (kg)', accessorKey: 'ultimo_peso_kg', cell: info => info.getValue() ?? '—' },
    { header: 'Cochinera', accessorKey: 'id_cochinera_actual', cell: info => info.getValue() ?? '—' },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: info => <Link to={`/cerdos/${info.row.original.id_cerdo}`} style={{ color: '#2563eb', fontWeight: 600 }}>Ver</Link>
    }
  ], [])

  return (
    <div>
      <PageHeader title="Cerdos">
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Registrar cerdo</button>
      </PageHeader>

      <div style={card}>
        <DataTable data={cerdos} columns={columns} />
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
