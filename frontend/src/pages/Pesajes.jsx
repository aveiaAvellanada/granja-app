import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getPesajes, registrarPesaje, getPendientes } from '../api/pesajes.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'

export default function Pesajes() {
  const [pesajes, setPesajes] = useState([])
  const [pendientes, setPendientes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const reload = () => {
    getPesajes().then((r) => setPesajes(r.data)).catch(() => {})
    getPendientes().then((r) => setPendientes(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }

  useEffect(reload, [])

  async function onSubmit(data) {
    await registrarPesaje(data)
    reset()
    setShowModal(false)
    reload()
  }

  const columns = useMemo(() => [
    { header: 'ID Pesaje', accessorKey: 'id_pesaje' },
    { header: 'Cerdo', accessorKey: 'id_cerdo', cell: info => `#${info.getValue()}` },
    { header: 'Peso (kg)', accessorKey: 'peso_kg', cell: info => <span style={{ fontWeight: 700 }}>{info.getValue()}</span> },
    { header: 'Fecha', accessorKey: 'fecha_pesaje', cell: info => info.getValue()?.slice(0, 10) },
    { header: 'Empleado', accessorKey: 'id_empleado' }
  ], [])

  return (
    <div>
      <PageHeader title="Pesajes">
        <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Registrar pesaje</button>
      </PageHeader>

      {pendientes.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <strong>{pendientes.length} cerdos sin pesaje reciente:</strong>{' '}
          {pendientes.map((p) => `#${p.id_cerdo}`).join(', ')}
        </div>
      )}

      <div style={card}>
        <DataTable data={pesajes} columns={columns} />
      </div>

      {showModal && (
        <Modal title="Registrar pesaje" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="ID Cerdo" error={errors.id_cerdo?.message}>
              <input style={inputStyle} type="number" {...register('id_cerdo', { required: true })} />
            </FormField>
            <FormField label="Peso (kg)" error={errors.peso_kg?.message}>
              <input style={inputStyle} type="number" step="0.1" {...register('peso_kg', { required: true })} />
            </FormField>
            <FormField label="ID Empleado" error={errors.id_empleado?.message}>
              <input style={inputStyle} type="number" {...register('id_empleado', { required: true })} />
            </FormField>
            <FormField label="Observaciones">
              <textarea style={{ ...inputStyle, height: 70 }} {...register('observaciones')} />
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}