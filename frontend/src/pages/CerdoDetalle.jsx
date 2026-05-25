import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getCerdo, getHistorialPeso, trasladarCerdo, registrarMuerte } from '../api/cerdos.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, btnDanger, card } from '../components/FormField.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

export default function CerdoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [historial, setHistorial] = useState([])
  const [modal, setModal] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  const trasladarForm = useForm()
  const muerteForm = useForm()

  useEffect(() => {
    getCerdo(id).then((r) => setData(r.data)).catch(() => {})
    getHistorialPeso(id).then((r) => setHistorial(r.data)).catch(() => {})
  }, [id])

  function requestTraslado(values) {
    setConfirmAction({ type: 'trasladar', values })
  }

  function requestMuerte(values) {
    setConfirmAction({ type: 'muerte', values })
  }

  async function onTrasladar() {
    await trasladarCerdo(id, confirmAction.values)
    setConfirmAction(null)
    setModal(null)
    navigate('/cerdos')
  }

  async function onMuerte() {
    await registrarMuerte(id, confirmAction.values)
    setConfirmAction(null)
    setModal(null)
    navigate('/cerdos')
  }

  if (!data) return <p>Cargando...</p>
  const { cerdo, genealogia } = data

  return (
    <div>
      <PageHeader title={`Cerdo #${id}`}>
        <button style={btnPrimary} onClick={() => setModal('trasladar')}>Trasladar</button>
        <button style={btnDanger} onClick={() => setModal('muerte')}>Registrar muerte</button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Datos</h3>
          <Detail label="Sexo" value={cerdo.sexo_cerdo} />
          <Detail label="Raza" value={cerdo.raza} />
          <Detail label="Cochinera" value={cerdo.id_cochinera_actual} />
          <Detail label="Edad" value={`${cerdo.edad_dias ?? '—'} días`} />
          <Detail label="Último peso" value={`${cerdo.ultimo_peso_kg ?? '—'} kg`} />
        </div>
        {genealogia?.length > 0 && (
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Árbol genealógico</h3>
            <table>
              <thead><tr><th>ID</th><th>Relación</th><th>Sexo</th></tr></thead>
              <tbody>
                {genealogia.map((g, i) => {
                  let relacion = g.generacion === 0 ? 'Este cerdo' :
                                 g.generacion === 1 ? (g.sexo === 'Macho' ? 'Padre' : 'Madre') :
                                 g.generacion === 2 ? (g.sexo === 'Macho' ? 'Abuelo' : 'Abuela') :
                                 `Ancestro (Gen ${g.generacion})`;
                  return (
                    <tr key={i}>
                      <td>{g.id_cerdo}</td>
                      <td>{relacion}</td>
                      <td>{g.sexo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {historial.length > 0 && (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Evolución de peso</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={historial}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tickFormatter={(d) => d?.slice(0, 10)} />
              <YAxis unit=" kg" />
              <Tooltip />
              <Line type="monotone" dataKey="peso_kg" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {modal === 'trasladar' && (
        <Modal title="Trasladar cerdo" onClose={() => setModal(null)}>
          <form onSubmit={trasladarForm.handleSubmit(requestTraslado)}>
            <FormField label="ID Cochinera destino">
              <input style={inputStyle} type="number" {...trasladarForm.register('id_cochinera_destino', { required: true })} />
            </FormField>
            <FormField label="Motivo">
              <input style={inputStyle} {...trasladarForm.register('motivo')} />
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Confirmar traslado</button>
          </form>
        </Modal>
      )}

      {modal === 'muerte' && (
        <Modal title="Registrar muerte" onClose={() => setModal(null)}>
          <form onSubmit={muerteForm.handleSubmit(requestMuerte)}>
            <FormField label="Causa">
              <input style={inputStyle} {...muerteForm.register('causa', { required: true })} />
            </FormField>
            <FormField label="Método de disposición">
              <input style={inputStyle} {...muerteForm.register('metodo_disposicion')} />
            </FormField>
            <button type="submit" style={{ ...btnDanger, width: '100%' }}>Confirmar</button>
          </form>
        </Modal>
      )}

      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'trasladar' ? 'Confirmar traslado' : 'Registrar muerte'}
        message={
          confirmAction?.type === 'trasladar'
            ? `¿Seguro que deseas trasladar el cerdo #${id} a la cochinera seleccionada? Esta acción moverá al animal de su ubicación actual.`
            : `¿Confirmas que el cerdo #${id} ha fallecido? Esta acción es irreversible y cambiará su estado a Muerto permanentemente.`
        }
        confirmColor={confirmAction?.type === 'trasladar' ? 'blue' : 'red'}
        onConfirm={confirmAction?.type === 'trasladar' ? onTrasladar : onMuerte}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value ?? '—'}</span>
    </div>
  )
}
