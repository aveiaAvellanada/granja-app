export default function PageHeader({ title, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{title}</h1>
      <div style={{ display: 'flex', gap: '0.75rem' }}>{children}</div>
    </div>
  )
}
