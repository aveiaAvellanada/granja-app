import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getCochineras, createCochinera, updateCochinera } from '../api/cochineras.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'

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
    const nuevoEstado = c.estado_cochinera === 'En Mantenimiento' ? 'Disponible' : 'En Mantenimiento'
    await updateCochinera(c.id_cochinera, { estado_cochinera: nuevoEstado })
    getCochineras().then((r) => setCochineras(r.data))
  }

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'id_cochinera' },
    { header: 'Capacidad Máxima', accessorKey: 'capacidad_max' },
    { header: 'Ocupación Actual', accessorKey: 'ocupacion_actual', cell: info => info.getValue() ?? 0 },
    { header: 'Espacios Libres', accessorKey: 'espacios_libres', cell: info => info.getValue() ?? info.row.original.capacidad_max },
    { header: 'Estado', accessorKey: 'estado_cochinera' },
    {
      header: 'Acción',
      id: 'accion',
      cell: info => {
        const c = info.row.original;
        return (
          <button
            onClick={() => toggleEstado(c)}
            style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff' }}
          >
            {c.estado_cochinera === 'En Mantenimiento' ? 'Habilitar' : 'Mantenimiento'}
          </button>
        )
      }
    }
  ], [])

  return (
    <div>
      <PageHeader title="Cochineras">
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Nueva cochinera</button>
      </PageHeader>

      <div style={card}>
        <DataTable data={cochineras} columns={columns} />
      </div>

      {showModal && (
        <Modal title="Nueva cochinera" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Capacidad Máxima"><input style={inputStyle} type="number" {...register('capacidad_max', { required: true })} /></FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Crear</button>
          </form>
        </Modal>
      )}
    </div>
  )
}