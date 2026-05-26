import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getResumen, getAlertas, getVentasAnio } from '../api/dashboard.api.js'
import { getPendientes } from '../api/veterinario.api.js'
import { card } from '../components/FormField.jsx'
import PageHeader from '../components/PageHeader.jsx'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function Dashboard() {
  const navigate = useNavigate()
  const [resumen, setResumen] = useState(null)
  const [alertas, setAlertas] = useState([])
  const [ventasData, setVentasData] = useState([])
  const [pendientesSalud, setPendientesSalud] = useState(0)
  const anio = new Date().getFullYear()

  useEffect(() => {
    getResumen().then((r) => setResumen(r.data)).catch(() => {})
    getAlertas().then((r) => setAlertas(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    getPendientes().then((r) => setPendientesSalud(Array.isArray(r.data) ? r.data.length : 0)).catch(() => {})
    getVentasAnio(anio).then((r) => {
      const rows = Array.isArray(r.data) ? r.data : []
      setVentasData(rows.map((x) => ({ ...x, mes: MESES[(x.mes ?? 1) - 1] })))
    }).catch(() => {})
  }, [])

  return (
    <div>
      <PageHeader title={`Dashboard ${anio}`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Cerdos activos" value={resumen?.total_cerdos ?? '—'} color="#2563eb" />
        <StatCard label="Cochineras" value={resumen?.cochineras?.length ?? '—'} color="#059669" />
        <div onClick={() => navigate('/registros', { state: { tab: 2 } })} style={{ cursor: 'pointer' }}>
          <StatCard 
            label="Pendientes Salud (>30d)" 
            value={pendientesSalud} 
            color={pendientesSalud > 0 ? '#dc2626' : '#059669'} 
          />
        </div>
        <StatCard label="Otras Alertas" value={alertas.length} color={alertas.length > 0 ? '#dc2626' : '#6b7280'} />
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
              <Bar dataKey="total_ingresos" name="Total ingresos ($)" fill="#2563eb" />
              <Bar dataKey="cantidad_cerdos" name="Cerdos vendidos" fill="#10b981" />
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
                  <td><span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '2px 8px', fontSize: '0.8rem' }}>{a.tipo_alerta}</span></td>
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
    <div style={{ ...card, textAlign: 'center', margin: 0 }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>{label}</div>
    </div>
  )
}
