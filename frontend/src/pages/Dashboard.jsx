import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getResumen, getAlertas, getVentasAnio } from '../api/dashboard.api.js'
import { getPendientes } from '../api/veterinario.api.js'
import { card } from '../components/FormField.jsx'
import PageHeader from '../components/PageHeader.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function Dashboard() {
  const navigate = useNavigate()
  const [resumen, setResumen] = useState(null)
  const [alertas, setAlertas] = useState([])
  const [ventasData, setVentasData] = useState([])
  const [pendientesSalud, setPendientesSalud] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const anio = new Date().getFullYear()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [rRes, rAle, rPen, rVen] = await Promise.all([
        getResumen(),
        getAlertas(),
        getPendientes(),
        getVentasAnio(anio)
      ])
      setResumen(rRes.data)
      setAlertas(Array.isArray(rAle.data) ? rAle.data : [])
      setPendientesSalud(Array.isArray(rPen.data) ? rPen.data.length : 0)
      const rows = Array.isArray(rVen.data) ? rVen.data : []
      setVentasData(rows.map((x) => ({ ...x, mes: MESES[(x.mes ?? 1) - 1] })))
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <LoadingSpinner message="Cargando resumen..." />
  if (error) return <ErrorMessage message={error} onRetry={loadData} />

  return (
    <div>
      <PageHeader title={`Dashboard ${anio}`} />
...
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Cerdos activos" value={resumen?.total_cerdos ?? '—'} color="#4A7C35" />
        <StatCard label="Cochineras" value={resumen?.cochineras?.length ?? '—'} color="#4A7C35" />
        <div onClick={() => navigate('/registros', { state: { tab: 2 } })} style={{ cursor: 'pointer' }}>
          <StatCard
            label="Pendientes Salud (>30d)"
            value={pendientesSalud}
            color={pendientesSalud > 0 ? '#B5341F' : '#4A7C35'}
          />
        </div>
        <StatCard label="Otras Alertas" value={alertas.length} color={alertas.length > 0 ? '#C97A1A' : '#9A9282'} />
      </div>

      {ventasData.length > 0 && (
        <div style={{ ...card, marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem' }}>Ventas por mes — {anio}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ventasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_ingresos" name="Total ingresos ($)" fill="#4A7C35" />
              <Bar dataKey="cantidad_cerdos" name="Cerdos vendidos" fill="#C97A1A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {alertas.length > 0 && (
        <div style={card}>
          <h3 style={{ margin: '0 0 1rem' }}>Alertas operativas</h3>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Referencia</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((a, i) => (
                <tr key={i}>
                  <td><span style={{ background: '#FEF3E2', color: '#C97A1A', borderRadius: 6, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>{a.tipo_alerta}</span></td>
                  <td style={{ fontWeight: 600, color: '#374151' }}>{a.referencia ?? '—'}</td>
                  <td>{a.descripcion ?? JSON.stringify(a)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      boxShadow: '0 2px 10px rgba(26,46,26,0.07), 0 0 0 1px rgba(26,46,26,0.04)',
      border: '1px solid #EDE8DF',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '2.1rem',
        fontWeight: 900,
        color,
        fontFamily: "'Fraunces', Georgia, serif",
        lineHeight: 1.1,
      }}>{value}</div>
      <div style={{ color: '#9A9282', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}
