import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { 
  getResumen, 
  getAlertas, 
  getVentasAnio, 
  getMortalidad, 
  getOcupacion, 
  getActividad 
} from '../api/dashboard.api.js'
import { getPendientes } from '../api/veterinario.api.js'
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
  const [mortalidadData, setMortalidadData] = useState([])
  const [ocupacion, setOcupacion] = useState([])
  const [actividad, setActividad] = useState([])
  const [pendientesSalud, setPendientesSalud] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const anio = new Date().getFullYear()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [rRes, rAle, rPen, rVen, rMor, rOcu, rAct] = await Promise.all([
        getResumen(),
        getAlertas(),
        getPendientes(),
        getVentasAnio(anio),
        getMortalidad(),
        getOcupacion(),
        getActividad()
      ])
      
      setResumen(rRes.data)
      setAlertas(Array.isArray(rAle.data) ? rAle.data : [])
      setPendientesSalud(Array.isArray(rPen.data) ? rPen.data.length : 0)
      
      const vRows = Array.isArray(rVen.data) ? rVen.data : []
      setVentasData(vRows.map(x => ({ ...x, mes: MESES[(x.mes ?? 1) - 1] })))
      
      const mRows = Array.isArray(rMor.data) ? rMor.data : []
      setMortalidadData(mRows.map(x => ({ ...x, mes: MESES[(x.mes ?? 1) - 1] })).reverse())
      
      setOcupacion(Array.isArray(rOcu.data) ? rOcu.data : [])
      setActividad(Array.isArray(rAct.data) ? rAct.data : [])
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
    <div className="page-animate">
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
          value={resumen?.cerdos_activos ?? '0'}
          tone="green"
          hint="En las cochineras actualmente"
        />
        <StatCard
          icon="badge"
          label="Cerdos vendidos"
          value={resumen?.cerdos_vendidos ?? '0'}
          tone="neutral"
          hint="Historial acumulado"
        />
        <StatCard
          icon="chart"
          label="Mortalidad"
          value={resumen?.cerdos_muertos ?? '0'}
          tone="neutral"
          hint="Historial acumulado"
        />
        <StatCard
          icon="receipt"
          label="Ingresos Mes"
          value={`$ ${(Number(resumen?.ingresos_mes_actual) || 0).toLocaleString('es-CO')}`}
          tone="green"
          hint="Ventas completadas hoy"
        />
        <StatCard
          icon="shield"
          label="Pendientes salud"
          sub=">30 d"
          value={pendientesSalud}
          tone={pendientesSalud > 0 ? 'danger' : 'green'}
          hint="Cerdos sin revisión"
          onClick={() => navigate('/registros', { state: { tab: 2 } })}
        />
        <StatCard
          icon="box"
          label="Stock bajo"
          value={resumen?.items_stock_bajo ?? '0'}
          tone={Number(resumen?.items_stock_bajo) > 0 ? 'danger' : 'green'}
          hint="Items de inventario < 10"
          onClick={() => navigate('/inventario', { state: { tab: 3 } })}
        />
      </div>

      <div style={layoutGrid}>
        {/* FILA 2 - IZQUIERDA: VENTAS */}
        <div className="card col gap-4" style={{ gridColumn: 'span 3', padding: '1.5rem' }}>
          <div style={chartHead}>
            <div>
              <div className="row-center gap-2">
                <h3 style={chartTitle}>Ventas por mes</h3>
                <span className="badge badge-success badge-mono">Año {anio}</span>
              </div>
              <p style={chartSub}>Ingresos generados y cerdos vendidos</p>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <Summary label="Total ingresos" value={`$ ${totalIngresos.toLocaleString('es-CO')}`} color="var(--green)" />
              <Summary label="Vendidos" value={totalVendidos} color="var(--amber)" />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ventasData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green-accent)" />
                  <stop offset="100%" stopColor="var(--green)" />
                </linearGradient>
                <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="var(--amber)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border-soft)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: 'var(--ink-3)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis tick={{ fill: 'var(--ink-3)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(22,101,52,0.04)' }}
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 10, boxShadow: 'var(--shadow-lg)' }}
                formatter={(v, name) => name === 'Total ingresos ($)' ? [`$ ${Number(v).toLocaleString('es-CO')}`, name] : [v, name]}
              />
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: '0.75rem' }} iconType="circle" />
              <Bar dataKey="total_ingresos" name="Total ingresos ($)" fill="url(#gradGreen)" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="cantidad_cerdos" name="Cerdos vendidos" fill="url(#gradAmber)" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* FILA 2 - DERECHA: OCUPACIÓN */}
        <div className="card col gap-4" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
          <h3 style={chartTitle}>Ocupación Cochineras</h3>
          <div className="col gap-3 scroll-dark" style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 8 }}>
            {ocupacion.map(c => {
              const cap = Number(c.capacidad_max || 1)
              const ocu = Number(c.ocupacion_actual || 0)
              const pct = Math.min((ocu / cap) * 100, 100)
              let color = 'var(--green-accent)'
              if (pct > 90) color = 'var(--rust)'
              else if (pct >= 70) color = 'var(--amber)'

              return (
                <div key={c.id_cochinera} className="col gap-1">
                  <div className="row-between">
                    <span className="text-strong" style={{ fontSize: '0.85rem' }}>#{c.id_cochinera} <span className="text-muted" style={{ fontWeight: 400 }}>{c.estado_cochinera}</span></span>
                    <span className="eyebrow" style={{ fontSize: '0.65rem' }}>{ocu} / {cap}</span>
                  </div>
                  <div style={progressBg}>
                    <div style={{ ...progressFill, width: `${pct}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* FILA 3 - IZQUIERDA: MORTALIDAD */}
        <div className="card col gap-4" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
          <h3 style={chartTitle}>Mortalidad Mensual</h3>
          {mortalidadData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mortalidadData}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: 'var(--ink-3)', fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--ink-3)', fontSize: 10 }} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', borderRadius: 8, fontSize: '0.8rem' }} />
                <Bar dataKey="cantidad_muertes" name="Bajas" fill="var(--rust)" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={emptyBox}>Sin registros de mortalidad</div>
          )}
        </div>

        {/* FILA 3 - DERECHA: ACTIVIDAD */}
        <div className="card col gap-4" style={{ gridColumn: 'span 3', padding: '1.5rem' }}>
          <h3 style={chartTitle}>Actividad Reciente</h3>
          <div className="col gap-3">
            {actividad.map((a, i) => (
              <div key={i} className="row-center gap-3">
                <div style={activityIcon(a.tipo)}>
                  <Icon name={a.tipo === 'venta' ? 'receipt' : a.tipo === 'traslado' ? 'transfer' : 'clipboard'} size={14} />
                </div>
                <div className="col" style={{ flex: 1 }}>
                  <div className="row-between">
                    <span className="text-strong" style={{ fontSize: '0.85rem' }}>{a.descripcion}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatearFechaRelativa(a.fecha)}</span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>{a.detalle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Alertas table ════════════════════════════════════ */}
      {alertas.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-soft)' }}>
            <div className="row-center gap-2">
              <h3 style={chartTitle}>Alertas operativas</h3>
              <span className="badge badge-amber">{alertas.length} pendientes</span>
            </div>
          </div>
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
                <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)' }}>
                  <td style={alertTd}>
                    <span className="badge badge-amber">{a.tipo_alerta}</span>
                  </td>
                  <td style={{ ...alertTd, fontWeight: 600 }}>{a.referencia ?? '—'}</td>
                  <td style={{ ...alertTd, color: 'var(--ink-2)' }}>{a.descripcion ?? JSON.stringify(a)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
    neutral: { accent: 'var(--ink-2)', bg: 'var(--surface-sunken)', fg: 'var(--ink-2)', border: 'var(--border)' },
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
        <div style={{ width: 34, height: 34, borderRadius: 8, background: t.bg, color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.border}` }}>
          <Icon name={icon} size={16} />
        </div>
        {onClick && <Icon name="chevron-right" size={12} color="var(--ink-muted)" />}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--ink)',
          fontFamily: "var(--font-display)",
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>{value}</div>
        {sub && <div style={{ fontSize: '0.65rem', color: 'var(--ink-muted)', fontWeight: 600 }}>{sub}</div>}
      </div>

      <div style={{ marginTop: 4, fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-2)' }}>{label}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', marginTop: 2 }}>{hint}</div>
    </div>
  )
}

function Summary({ label, value, color }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 10 }}>
      <div className="eyebrow" style={{ fontSize: '0.6rem' }}>{label}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>{value}</div>
    </div>
  )
}

function activityIcon(tipo) {
  const colors = {
    venta: { bg: 'var(--green-soft)', fg: 'var(--green-ink)' },
    traslado: { bg: 'var(--info-soft)', fg: 'var(--info-ink)' },
    registro: { bg: 'var(--amber-soft)', fg: 'var(--amber-ink)' }
  }
  const c = colors[tipo] || { bg: 'var(--surface-sunken)', fg: 'var(--ink-2)' }
  return {
    width: 32, height: 32, borderRadius: 8,
    background: c.bg, color: c.fg,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }
}

function formatearFechaRelativa(fecha) {
  const segs = Math.floor((new Date() - new Date(fecha)) / 1000)
  if (segs < 60) return 'Ahora mismo'
  if (segs < 3600) return `Hace ${Math.floor(segs / 60)}m`
  if (segs < 86400) return `Hace ${Math.floor(segs / 3600)}h`
  return `Hace ${Math.floor(segs / 86400)}d`
}

/* ════ Styles ════════════════════════════════════════════════════ */

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem',
}

const layoutGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '1.5rem',
}

const chartHead = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: 16,
  marginBottom: 20,
}

const chartTitle = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 700,
}

const chartSub = {
  margin: '3px 0 0',
  fontSize: '0.8rem',
  color: 'var(--ink-3)',
}

const alertTh = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '0.65rem',
  fontWeight: 600,
  color: 'var(--ink-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  background: 'var(--surface-2)',
  borderBottom: '1px solid var(--border)',
}

const alertTd = {
  padding: '10px 14px',
  fontSize: '0.85rem',
  borderBottom: '1px solid var(--border-soft)',
}

const progressBg = {
  width: '100%', height: 5,
  background: 'var(--canvas-deep)',
  borderRadius: 99,
  overflow: 'hidden'
}

const progressFill = {
  height: '100%',
  transition: 'width 0.6s var(--ease-out)'
}

const emptyBox = {
  height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--surface-2)', borderRadius: 10, color: 'var(--ink-muted)', fontSize: '0.85rem'
}
