import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getResumen, getAlertas, getVentasAnio } from '../api/dashboard.api.js'
import { getPendientes } from '../api/veterinario.api.js'
import { card, colors } from '../components/FormField.jsx'
import PageHeader from '../components/PageHeader.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { Icon } from '../components/Icon.jsx'

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
      setVentasData(rows.map(x => ({ ...x, mes: MESES[(x.mes ?? 1) - 1] })))
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (loading) return <LoadingSpinner message="Cargando resumen operativo..." />
  if (error) return <ErrorMessage message={error} onRetry={loadData} />

  const totalIngresos = ventasData.reduce((a, v) => a + Number(v.total_ingresos || 0), 0)
  const totalVendidos = ventasData.reduce((a, v) => a + Number(v.cantidad_cerdos || 0), 0)
  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div>
      <PageHeader
        title={`Panel general · ${anio}`}
        subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
        icon={<Icon name="dashboard" size={20} />}
      />

      {/* ═══ KPI Grid ═══════════════════════════════════════════ */}
      <div style={kpiGrid}>
        <StatCard
          icon="pig"
          label="Cerdos activos"
          value={resumen?.total_cerdos ?? '—'}
          tone="green"
          hint="En las cochineras actualmente"
        />
        <StatCard
          icon="barn"
          label="Cochineras"
          value={resumen?.cochineras?.length ?? '—'}
          tone="green"
          hint="Total registradas"
        />
        <StatCard
          icon="shield"
          label="Pendientes salud"
          sub=">30 días"
          value={pendientesSalud}
          tone={pendientesSalud > 0 ? 'danger' : 'green'}
          hint="Cerdos sin revisión médica"
          onClick={() => navigate('/registros', { state: { tab: 2 } })}
        />
        <StatCard
          icon="alert"
          label="Otras alertas"
          value={alertas.length}
          tone={alertas.length > 0 ? 'amber' : 'neutral'}
          hint="Stock, pesajes y operación"
        />
      </div>

      {/* ═══ Ventas chart ══════════════════════════════════════ */}
      {ventasData.length > 0 && (
        <div style={{ ...card, padding: '1.4rem 1.5rem 1rem', marginBottom: '1.25rem' }}>
          <div style={chartHead}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={chartTitle}>Ventas por mes</h3>
                <span className="badge badge-success" style={{ textTransform: 'none', letterSpacing: '0.02em' }}>Año {anio}</span>
              </div>
              <p style={chartSub}>Ingresos generados y cerdos vendidos en cada mes</p>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <Summary label="Total ingresos" value={`$ ${totalIngresos.toLocaleString('es-CO')}`} color={colors.green} />
              <Summary label="Cerdos vendidos" value={totalVendidos} color={colors.amber} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ventasData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" />
                  <stop offset="100%" stopColor="#166534" />
                </linearGradient>
                <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#E3E8DF" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'Inter' }} tickLine={false} axisLine={{ stroke: '#D5DAD0' }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(22,101,52,0.04)' }}
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E3E8DF', borderRadius: 10, boxShadow: '0 12px 28px rgba(0,0,0,0.08)', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem' }}
                formatter={(v, name) => name === 'Total ingresos ($)'
                  ? [`$ ${Number(v).toLocaleString('es-CO')}`, name]
                  : [v, name]}
              />
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: '0.79rem', fontFamily: 'Inter' }} iconType="circle" />
              <Bar dataKey="total_ingresos" name="Total ingresos ($)" fill="url(#gradGreen)" radius={[5, 5, 0, 0]} maxBarSize={30} />
              <Bar dataKey="cantidad_cerdos" name="Cerdos vendidos" fill="url(#gradAmber)" radius={[5, 5, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ═══ Alertas table ════════════════════════════════════ */}
      {alertas.length > 0 && (
        <div style={card}>
          <div style={chartHead}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={chartTitle}>Alertas operativas</h3>
                <span className="badge badge-amber">{alertas.length} pendientes</span>
              </div>
              <p style={chartSub}>Eventos que requieren atención inmediata del personal</p>
            </div>
          </div>

          <div style={{ border: '1px solid #E3E8DF', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={alertTh}>Tipo</th>
                  <th style={alertTh}>Referencia</th>
                  <th style={alertTh}>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((a, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F7FAF4' }}>
                    <td style={alertTd}>
                      <span className="badge badge-amber">{a.tipo_alerta}</span>
                    </td>
                    <td style={{ ...alertTd, fontWeight: 600, color: '#111827' }}>{a.referencia ?? '—'}</td>
                    <td style={{ ...alertTd, color: '#374151' }}>{a.descripcion ?? JSON.stringify(a)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ════ Sub-components ════════════════════════════════════════════ */

function StatCard({ icon, label, sub, value, tone = 'green', hint, onClick }) {
  const toneMap = {
    green:   { accent: 'var(--green)', bg: 'var(--green-soft)', fg: 'var(--green-ink)', border: 'var(--green-soft-2)' },
    amber:   { accent: 'var(--amber)', bg: 'var(--amber-soft)', fg: 'var(--amber-ink)', border: 'var(--amber-line)' },
    danger:  { accent: 'var(--rust)', bg: 'var(--rust-soft)', fg: 'var(--rust-ink)', border: 'var(--border-soft)' },
    neutral: { accent: 'var(--ink-3)', bg: 'var(--surface-sunken)', fg: 'var(--ink-2)', border: 'var(--border)' },
  }
  const t = toneMap[tone]
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--r-lg)',
        padding: '1.2rem 1.25rem',
        border: '1px solid var(--border-soft)',
        borderLeft: `4px solid ${t.accent}`,
        boxShadow: 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
      }}
      onClick={onClick}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: t.bg, color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.border}` }}>
          <Icon name={icon} size={17} />
        </div>
        {onClick && <Icon name="arrow-right" size={13} color="var(--ink-muted)" />}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <div style={{
          fontSize: '1.875rem',
          fontWeight: 800,
          color: tone === 'danger' ? 'var(--rust)' : 'var(--ink)',
          fontFamily: "var(--font-display)",
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>{value}</div>
        {sub && <div style={{ fontSize: '0.67rem', color: 'var(--ink-muted)', fontWeight: 600 }}>{sub}</div>}
      </div>

      <div style={{ marginTop: 4, fontSize: '0.79rem', fontWeight: 600, color: 'var(--ink-2)', fontFamily: "var(--font-body)" }}>{label}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: 2, fontFamily: "var(--font-body)" }}>{hint}</div>
    </div>
  )
}

function Summary({ label, value, color }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 11 }}>
      <div style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, fontFamily: "var(--font-body)" }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ink)', fontFamily: "var(--font-display)", marginTop: 2, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  )
}

/* ════ Styles ════════════════════════════════════════════════════ */

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem',
}

const chartHead = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: 16,
  marginBottom: 16,
}

const chartTitle = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: '1rem',
  color: 'var(--ink)',
  fontWeight: 700,
  letterSpacing: '-0.01em',
}

const chartSub = {
  margin: '3px 0 0',
  fontSize: '0.81rem',
  color: 'var(--ink-3)',
  fontFamily: "var(--font-body)",
}

const alertTh = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '0.67rem',
  fontWeight: 600,
  color: 'var(--ink-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  background: 'var(--surface-2)',
  borderBottom: '1.5px solid var(--border)',
  fontFamily: "var(--font-body)",
}

const alertTd = {
  padding: '10px 14px',
  fontSize: '0.875rem',
  borderBottom: '1px solid var(--border-soft)',
  fontFamily: "var(--font-body)",
}
