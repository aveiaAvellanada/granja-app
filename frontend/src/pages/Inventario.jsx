import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getInventario, getAlertas, createItem, updateStock } from '../api/inventario.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ExportButton from '../components/ExportButton'

const tabButtonStyle = (active) => ({
  padding: '0.75rem 1.5rem',
  cursor: 'pointer',
  border: 'none',
  background: active ? '#fff' : 'transparent',
  borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
  fontWeight: active ? '700' : '500',
  color: active ? '#2563eb' : '#6b7280',
  transition: 'all 0.2s'
})

const summaryCardStyle = (color = '#fff', textColor = '#1f2937') => ({
  ...card,
  flex: 1,
  padding: '1.25rem',
  background: color,
  color: textColor,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  minWidth: '200px'
})

const badgeStyle = (estado) => {
  let bg = '#f3f4f6'
  let color = '#6b7280'
  
  if (estado === 'Disponible') { bg = '#dcfce7'; color = '#166534' }
  else if (estado === 'Agotado') { bg = '#fee2e2'; color = '#991b1b' }
  else if (estado === 'Descontinuado') { bg = '#f3f4f6'; color = '#6b7280' }

  return {
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: bg,
    color: color,
    textTransform: 'uppercase'
  }
}

export default function Inventario() {
  const [items, setItems] = useState([])
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(1) // 1: Alimentos/Suplementos, 2: Medicamentos, 3: Alertas
  const [modal, setModal] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingStockUpdate, setPendingStockUpdate] = useState(null)

  const { register, handleSubmit, reset } = useForm()
  const stockForm = useForm()

  const [showStatusModal, setShowStatusModal] = useState(false)

  const reload = async () => {
    setLoading(true)
    setError(null)
    try {
      const [rInv, rAle] = await Promise.all([
        getInventario(),
        getAlertas(10)
      ])
      setItems(rInv.data)
      setAlertas(rAle.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const onCreateItem = async (data) => {
    try {
      await createItem(data)
      reset()
      setModal(null)
      reload()
    } catch (err) {
      console.error(err)
    }
  }

  const onUpdateStockSubmit = (data) => {
    setPendingStockUpdate(data.cantidad_stock)
    setShowConfirm(true)
  }

  const confirmStockUpdate = async () => {
    try {
      await updateStock(editItem.id_item, { cantidad_stock: pendingStockUpdate })
      stockForm.reset()
      setModal(null)
      setShowConfirm(false)
      setEditItem(null)
      setPendingStockUpdate(null)
      reload()
    } catch (err) {
      console.error(err)
    }
  }

  const onUpdateStatus = async (estado) => {
    try {
      await updateStock(editItem.id_item, { estado_item: estado })
      setShowStatusModal(false)
      setEditItem(null)
      reload()
    } catch (err) {
      console.error(err)
    }
  }

  const summary = useMemo(() => {
    return {
      disponibles: items.filter(i => i.estado_item === 'Disponible').length,
      agotados: items.filter(i => i.estado_item === 'Agotado').length,
      descontinuados: items.filter(i => i.estado_item === 'Descontinuado').length,
      bajoStock: alertas.length
    }
  }, [items, alertas])

  const filteredItems = useMemo(() => {
    if (activeTab === 1) return items.filter(i => i.id_tipo_item === 1 || i.id_tipo_item === 3)
    if (activeTab === 2) return items.filter(i => i.id_tipo_item === 2)
    if (activeTab === 3) return alertas
    return items
  }, [items, alertas, activeTab])

  const columns = useMemo(() => [
    { header: 'Nombre', accessorKey: 'nombre_item' },
    { header: 'Tipo', accessorKey: 'tipo_descripcion' },
    { 
      header: 'Stock', 
      accessorFn: row => `${row.cantidad_stock} ${row.abreviatura || ''}`,
      cell: info => (
        <span style={{ fontWeight: 700, color: info.row.original.cantidad_stock < 10 ? '#dc2626' : '#111827' }}>
          {info.getValue()}
        </span>
      )
    },
    { 
      header: 'Estado', 
      accessorKey: 'estado_item',
      cell: info => <span style={badgeStyle(info.getValue())}>{info.getValue()}</span>
    },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: info => {
        const item = info.row.original;
        return (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => { 
                setEditItem(item); 
                stockForm.setValue('cantidad_stock', item.cantidad_stock); 
                setModal('stock') 
              }}
              style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
              Stock
            </button>
            <button 
              onClick={() => { 
                setEditItem(item); 
                setShowStatusModal(true);
              }}
              style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
              Estado
            </button>
          </div>
        )
      }
    }
  ], [stockForm])

  return (
    <div>
      <PageHeader title="Inventario">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ExportButton data={filteredItems} filename={`Inventario_Tab${activeTab}`} />
          <button style={btnPrimary} onClick={() => setModal('nuevo')}>+ Nuevo item</button>
        </div>
      </PageHeader>

      {loading ? (
        <LoadingSpinner message="Cargando inventario..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <>
          {/* Global Summary */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={summaryCardStyle()}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Disponibles</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{summary.disponibles}</span>
            </div>
            <div style={summaryCardStyle()}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Agotados</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{summary.agotados}</span>
            </div>
            <div style={summaryCardStyle()}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Descontinuados</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{summary.descontinuados}</span>
            </div>
            <div style={summaryCardStyle('#fee2e2', '#991b1b')}>
              <span style={{ fontSize: '0.875rem' }}>⚠️ Bajo Stock ({"< 10"})</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{summary.bajoStock}</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
            <button style={tabButtonStyle(activeTab === 1)} onClick={() => setActiveTab(1)}>Alimentos y Suplementos</button>
            <button style={tabButtonStyle(activeTab === 2)} onClick={() => setActiveTab(2)}>Medicamentos</button>
            <button style={tabButtonStyle(activeTab === 3)} onClick={() => setActiveTab(3)}>
              ⚠️ Alertas de stock {alertas.length > 0 && <span style={{ background: '#dc2626', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', marginLeft: '5px' }}>{alertas.length}</span>}
            </button>
          </div>

          <div style={card}>
            <DataTable data={filteredItems} columns={columns} />
          </div>
        </>
      )}

      {/* Modals */}
      {modal === 'nuevo' && (
        <Modal title="Nuevo item de inventario" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onCreateItem)}>
            <FormField label="Nombre del item">
              <input style={inputStyle} {...register('nombre_item', { required: true })} placeholder="Ej: Purina Cerdos" />
            </FormField>
            <FormField label="Tipo">
              <select style={inputStyle} {...register('id_tipo_item', { required: true })}>
                <option value="1">Alimento Concentrado</option>
                <option value="2">Medicamento</option>
                <option value="3">Suplemento</option>
              </select>
            </FormField>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <FormField label="Stock inicial">
                  <input style={inputStyle} type="number" step="0.01" min="0" {...register('cantidad_stock', { required: true })} />
                </FormField>
              </div>
              <div style={{ flex: 1 }}>
                <FormField label="Unidad">
                  <select style={inputStyle} {...register('id_unidad_base', { required: true })}>
                    <option value="1">Kilogramos (kg)</option>
                    <option value="2">Gramos (g)</option>
                    <option value="3">Litros (L)</option>
                    <option value="4">Unidades (und)</option>
                  </select>
                </FormField>
              </div>
            </div>
            <FormField label="Estado">
              <select style={inputStyle} {...register('estado_item', { required: true })}>
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
                <option value="Descontinuado">Descontinuado</option>
              </select>
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%', marginTop: '1rem' }}>Crear Item</button>
          </form>
        </Modal>
      )}

      {modal === 'stock' && editItem && (
        <Modal title={`Actualizar stock — ${editItem.nombre_item}`} onClose={() => { setModal(null); setEditItem(null); }}>
          <form onSubmit={stockForm.handleSubmit(onUpdateStockSubmit)}>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Stock actual:</p>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{editItem.cantidad_stock} {editItem.abreviatura}</p>
            </div>
            <FormField label="Nueva cantidad">
              <input 
                style={inputStyle} 
                type="number" 
                step="0.01" 
                min="0"
                {...stockForm.register('cantidad_stock', { required: true })} 
                autoFocus
              />
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%', marginTop: '1rem' }}>Actualizar Stock</button>
          </form>
        </Modal>
      )}

      {showStatusModal && editItem && (
        <Modal title={`Cambiar estado — ${editItem.nombre_item}`} onClose={() => { setShowStatusModal(false); setEditItem(null); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p>Selecciona el nuevo estado para el item:</p>
            <button onClick={() => onUpdateStatus('Disponible')} style={{ ...btnPrimary, background: '#16a34a' }}>Disponible</button>
            <button onClick={() => onUpdateStatus('Agotado')} style={{ ...btnPrimary, background: '#dc2626' }}>Agotado</button>
            <button onClick={() => onUpdateStatus('Descontinuado')} style={{ ...btnPrimary, background: '#6b7280' }}>Descontinuado</button>
          </div>
        </Modal>
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        title="Confirmar actualización"
        message={`¿Confirmas actualizar el stock de ${editItem?.nombre_item} de ${editItem?.cantidad_stock} a ${pendingStockUpdate} ${editItem?.abreviatura}?`}
        onConfirm={confirmStockUpdate}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
