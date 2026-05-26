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

export default function Cerdos() {
  const [cerdos, setCerdos] = useState([])
  const [razas, setRazas] = useState([])
  const [cochineras, setCochineras] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const reloadData = async () => {
    try {
      const [rCerdos, rRazas, rCochineras] = await Promise.all([
        getCerdos(),
        getRazas(),
        getCochineras()
      ])
      setCerdos(rCerdos.data)
      setRazas(rRazas.data)
      setCochineras(rCochineras.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    reloadData()
  }, [])

  async function onSubmit(data) {
    try {
      // Convert optional strings to null if empty
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

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'id_cerdo' },
    { header: 'Sexo', accessorKey: 'sexo_cerdo' },
    { header: 'Raza', accessorKey: 'raza', cell: info => info.getValue() ?? '—' },
    { header: 'Edad', accessorKey: 'edad_dias', cell: info => info.getValue() != null ? `${info.getValue()} días` : '—' },
    { header: 'Peso (kg)', accessorKey: 'ultimo_peso_kg', cell: info => info.getValue() ?? '—' },
    { header: 'Cochinera', accessorKey: 'id_cochinera_actual', cell: info => info.getValue() ? `Cochinera #${info.getValue()}` : '—' },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: info => <Link to={`/cerdos/${info.row.original.id_cerdo}`} style={{ color: '#2563eb', fontWeight: 600 }}>Ver</Link>
    }
  ], [])

  return (
    <div>
      <PageHeader title="Cerdos">
        <button style={btnPrimary} onClick={() => { setError(''); setShowModal(true); }}>+ Registrar cerdo</button>
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

            <FormField label="Padre (opcional)">
              <select style={inputStyle} {...register('id_padre')}>
                <option value="">Sin padre conocido</option>
                {cerdos
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
                {cerdos
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

            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Registrar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
