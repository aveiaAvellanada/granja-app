import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPendientes } from '../api/veterinario.api.js'
import PageHeader from '../components/PageHeader.jsx'
import { card, btnPrimary } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'

export default function Veterinario() {
  const [pendientes, setPendientes] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getPendientes().then((r) => setPendientes(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  function irARevision(cerdo) {
    navigate('/registros', { 
      state: { 
        tab: 2, 
        id_cerdo: cerdo.id_cerdo 
      } 
    })
  }

  const columns = useMemo(() => [
    { header: 'Cerdo', accessorKey: 'id_cerdo', cell: info => `#${info.getValue()}` },
    { header: 'Última revisión', accessorKey: 'ultima_revision', cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : 'Nunca' },
    { 
      header: 'Días sin revisión', 
      accessorKey: 'dias_sin_revision',
      cell: info => <span style={{ color: '#dc2626', fontWeight: 700 }}>{info.getValue() ?? '—'}</span>
    },
    {
      header: 'Acción',
      id: 'accion',
      cell: info => {
        const p = info.row.original;
        return (
          <button onClick={() => irARevision(p)} style={{ ...btnPrimary, fontSize: '0.8rem', padding: '4px 12px' }}>
            Registrar revisión
          </button>
        )
      }
    }
  ], [])

  return (
    <div>
      <PageHeader title="Módulo Veterinario" />

      <div style={card}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>
          Cerdos pendientes de revisión (>30 días)
        </h3>
        
        <DataTable data={pendientes} columns={columns} />
        
        {pendientes.length === 0 && (
          <p style={{ textAlign: 'center', color: '#16a34a', padding: '2rem' }}>
            🎉 Todos los cerdos están al día con sus revisiones.
          </p>
        )}
      </div>
    </div>
  )
}