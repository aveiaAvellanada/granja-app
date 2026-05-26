import { Link } from 'react-router-dom'
import { btnPrimary } from '../components/FormField'
import { Icon } from '../components/Icon.jsx'

export default function NotFound() {
  return (
    <div style={container}>
      <div style={badge}>
        <Icon name="search" size={28} />
      </div>
      <div style={code}>404</div>
      <h1 style={title}>Página no encontrada</h1>
      <p style={message}>
        La ruta que buscas no existe o fue movida. Verifica el enlace
        o regresa al panel principal para continuar.
      </p>
      <Link to="/dashboard" style={{ ...btnPrimary, textDecoration: 'none' }}>
        <Icon name="arrow-left" size={15} /> Volver al Dashboard
      </Link>
    </div>
  )
}

const container = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '72vh',
  textAlign: 'center',
  padding: '2rem',
}

const badge = {
  width: 64, height: 64, borderRadius: 18,
  background: 'var(--green-soft)',
  color: 'var(--green)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: 18,
  border: '1px solid var(--green-soft-2)',
}

const code = {
  fontFamily: 'var(--font-display)',
  fontSize: '6.5rem',
  fontWeight: 900,
  color: 'var(--green)',
  marginBottom: 4,
  letterSpacing: '-0.04em',
  lineHeight: 1,
  background: 'linear-gradient(180deg, var(--green) 0%, var(--amber) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const title = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'var(--ink)',
  margin: '0 0 12px',
}

const message = {
  color: 'var(--ink-3)',
  maxWidth: 420,
  lineHeight: 1.6,
  marginBottom: '1.75rem',
  fontSize: '0.95rem',
}
