import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getPendientes, registrarRevision } from '../api/veterinario.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'

export default function Veterinario() {
  const [pendientes, setPendientes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedCerdo, setSelectedCerdo] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    getPendientes().then((r) => setPendientes(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  function abrirRevision(cerdo) {
    setSelectedCerdo(cerdo)
    setShowModal(true)
  }

  async function onSubmit(data) {
    await registrarRevision({ ...data, id_cerdo: selectedCerdo.id_cerdo })
    reset()
    setShowModal(false)
    getPendientes().then((r) => setPendientes(Array.isArray(r.data) ? r.data : []))
  }

  return (
    <div>
      <PageHeader title="Revisiones Médicas" />

      <div style={card}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>
          Cerdos pendientes de revisión ({pendientes.length})
        </h3>
        <table>
          <thead>
            <tr><th>Cerdo</th><th>Última revisión</th><th>Días sin revisión</th><th>Acción</th></tr>
          </thead>
          <tbody>
            {pendientes.map((p) => (
              <tr key={p.id_cerdo}>
                <td>#{p.id_cerdo}</td>
                <td>{p.ultima_revision?.slice(0, 10) ?? 'Nunca'}</td>
                <td style={{ color: '#dc2626', fontWeight: 700 }}>{p.dias_sin_revision ?? '—'}</td>
                <td>
                  <button onClick={() => abrirRevision(p)} style={{ ...btnPrimary, fontSize: '0.8rem', padding: '4px 12px' }}>
                    Registrar revisión
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pendientes.length === 0 && (
          <p style={{ textAlign: 'center', color: '#16a34a', padding: '1rem' }}>
            Todos los cerdos están al día con sus revisiones.
          </p>
        )}
      </div>

      {showModal && selectedCerdo && (
        <Modal title={`Revisión médica — Cerdo #${selectedCerdo.id_cerdo}`} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="ID Empleado / Veterinario">
              <input style={inputStyle} type="number" {...register('id_empleado', { required: true })} />
            </FormField>
            <FormField label="Diagnóstico">
              <textarea style={{ ...inputStyle, height: 80 }} {...register('diagnostico', { required: true })} />
            </FormField>
            <FormField label="ID Medicamento (opcional)">
              <input style={inputStyle} type="number" {...register('id_medicamento')} />
            </FormField>
            <FormField label="Observaciones">
              <textarea style={{ ...inputStyle, height: 60 }} {...register('observaciones')} />
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Guardar revisión</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
