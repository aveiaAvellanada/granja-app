import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getInventario, getAlertas, createItem, updateStock } from '../api/inventario.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import FormField, { inputStyle } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ExportButton from '../components/ExportButton'
import { Icon } from '../components/Icon.jsx'

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
    { header: 'Nombre', accessorKey: 'nombre_item', cell: info => <span className="text-strong">{info.getValue()}</span> },
    { header: 'Tipo', accessorKey: 'tipo_descripcion', cell: info => <span className="text-muted" style={{ fontSize: '0.8rem' }}>{info.getValue()}</span> },
    { 
      header: 'Stock Actual', 
      accessorFn: row => `${row.cantidad_stock} ${row.abreviatura || ''}`,
      cell: info => {
        const isLow = info.row.original.cantidad_stock < 10 && info.row.original.estado_item !== 'Descontinuado';
        return (
          <span className="text-mono" style={{ fontWeight: 700, color: isLow ? 'var(--rust)' : 'var(--ink)' }}>
            {info.getValue()}
            {isLow && <Icon name="alert" size={12} style={{ marginLeft: 6, color: 'var(--rust)' }} />}
          </span>
        )
      }
    },
    { 
      header: 'Estado', 
      accessorKey: 'estado_item',
      cell: info => {
        const val = info.getValue();
        let cls = 'badge-mono';
        if (val === 'Disponible') cls = 'badge-success';
        if (val === 'Agotado') cls = 'badge-danger';
        return <span className={`badge ${cls}`}>{val}</span>
      }
    },
    {
      header: 'Acciones',
      id: 'acciones',
      cell: info => {
        const item = info.row.original;
        return (
          <div className="row gap-2">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => { 
                setEditItem(item); 
                stockForm.setValue('cantidad_stock', item.cantidad_stock); 
                setModal('stock') 
              }}>
              <Icon name="box" size={12} /> Stock
            </button>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => { 
                setEditItem(item); 
                setShowStatusModal(true);
              }}>
              Estado
            </button>
          </div>
        )
      }
    }
  ], [stockForm])

  return (
    <div className="page-animate">
      <PageHeader title="Inventario y Almacén" icon={<Icon name="box" size={20} />}>
        <div className="row gap-2">
          <ExportButton data={filteredItems} filename={`Inventario_Tab${activeTab}`} />
          <button className="btn btn-primary" onClick={() => setModal('nuevo')}>
            <Icon name="plus" size={14} /> Nuevo item
          </button>
        </div>
      </PageHeader>

      {loading ? (
        <LoadingSpinner message="Sincronizando existencias..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <>
          {/* Global Summary */}
          <div style={kpiGrid}>
            <SummaryCard icon="box" label="Disponibles" value={summary.disponibles} tone="green" />
            <SummaryCard icon="alert" label="Agotados" value={summary.agotados} tone="neutral" />
            <SummaryCard icon="receipt" label="Descontinuados" value={summary.descontinuados} tone="neutral" />
            <SummaryCard icon="alert" label="Bajo Stock (< 10)" value={summary.bajoStock} tone="danger" pulse={summary.bajoStock > 0} />
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 1 ? 'is-active' : ''}`} onClick={() => setActiveTab(1)}>
              Alimentos y Suplementos
            </button>
            <button className={`tab-btn ${activeTab === 2 ? 'is-active' : ''}`} onClick={() => setActiveTab(2)}>
              Medicamentos y Salud
            </button>
            <button className={`tab-btn ${activeTab === 3 ? 'is-active' : ''}`} onClick={() => setActiveTab(3)}>
              <Icon name="alert" size={14} color={alertas.length > 0 ? 'var(--rust)' : 'inherit'} /> 
              Alertas críticas 
              {alertas.length > 0 && <span className="count" style={{ background: 'var(--rust)', color: '#fff' }}>{alertas.length}</span>}
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <DataTable data={filteredItems} columns={columns} />
          </div>
        </>
      )}

      {/* Modals */}
      {modal === 'nuevo' && (
        <Modal title="Crear nuevo registro" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onCreateItem)}>
            <FormField label="Nombre descriptivo">
              <input className="input" {...register('nombre_item', { required: true })} placeholder="Ej: Concentrado Engorde Fase 2" />
            </FormField>
            <FormField label="Categoría">
              <select className="input" {...register('id_tipo_item', { required: true })}>
                <option value="1">Alimento Concentrado</option>
                <option value="2">Medicamento / Veterinario</option>
                <option value="3">Suplemento / Aditivo</option>
              </select>
            </FormField>
            <div className="row gap-3">
              <div style={{ flex: 1 }}>
                <FormField label="Existencia inicial">
                  <input className="input text-mono" type="number" step="0.01" min="0" {...register('cantidad_stock', { required: true })} />
                </FormField>
              </div>
              <div style={{ flex: 1 }}>
                <FormField label="Unidad de medida">
                  <select className="input" {...register('id_unidad_base', { required: true })}>
                    <option value="1">Kilogramos (kg)</option>
                    <option value="2">Gramos (g)</option>
                    <option value="3">Litros (L)</option>
                    <option value="4">Unidades (und)</option>
                  </select>
                </FormField>
              </div>
            </div>
            <FormField label="Estado de disponibilidad">
              <select className="input" {...register('estado_item', { required: true })}>
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
                <option value="Descontinuado">Descontinuado</option>
              </select>
            </FormField>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary btn-block">Registrar en Inventario</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'stock' && editItem && (
        <Modal title="Actualizar Existencias" onClose={() => { setModal(null); setEditItem(null); }}>
          <form onSubmit={stockForm.handleSubmit(onUpdateStockSubmit)}>
            <div className="card-accent" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Balance actual: {editItem.nombre_item}</div>
              <div className="text-display" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {editItem.cantidad_stock} <span style={{ fontSize: '1rem', color: 'var(--ink-muted)' }}>{editItem.abreviatura}</span>
              </div>
            </div>
            <FormField label="Nueva cantidad física en almacén">
              <input 
                className="input text-mono" 
                type="number" 
                step="0.01" 
                min="0"
                style={{ fontSize: '1.25rem', textAlign: 'center' }}
                {...stockForm.register('cantidad_stock', { required: true })} 
                autoFocus
              />
            </FormField>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary btn-block">Confirmar ajuste de stock</button>
            </div>
          </form>
        </Modal>
      )}

      {showStatusModal && editItem && (
        <Modal title="Cambiar Estado Operativo" onClose={() => { setShowStatusModal(false); setEditItem(null); }}>
          <div className="col gap-3">
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Actualiza la disponibilidad de <strong>{editItem.nombre_item}</strong> para el personal:
            </p>
            <button className="btn btn-secondary btn-block" style={{ borderLeft: '4px solid var(--green)', justifyContent: 'flex-start' }} onClick={() => onUpdateStatus('Disponible')}>
              <span className="status-dot green" /> Disponible para uso
            </button>
            <button className="btn btn-secondary btn-block" style={{ borderLeft: '4px solid var(--rust)', justifyContent: 'flex-start' }} onClick={() => onUpdateStatus('Agotado')}>
              <span className="status-dot red" /> Marcar como Agotado
            </button>
            <button className="btn btn-secondary btn-block" style={{ borderLeft: '4px solid var(--ink-muted)', justifyContent: 'flex-start' }} onClick={() => onUpdateStatus('Descontinuado')}>
              <span className="status-dot" style={{ background: 'var(--ink-muted)' }} /> Descontinuar producto
            </button>
          </div>
        </Modal>
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        title="Confirmar ajuste de inventario"
        message={`¿Confirmas que la nueva existencia de ${editItem?.nombre_item} es de ${pendingStockUpdate} ${editItem?.abreviatura}?`}
        onConfirm={confirmStockUpdate}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

function SummaryCard({ icon, label, value, tone = 'neutral', pulse = false }) {
  const tones = {
    green:   { bg: 'var(--green-soft)', fg: 'var(--green-ink)', acc: 'var(--green)' },
    danger:  { bg: 'var(--rust-soft)',  fg: 'var(--rust-ink)',  acc: 'var(--rust)'  },
    neutral: { bg: 'var(--surface-sunken)', fg: 'var(--ink-2)', acc: 'var(--border)' }
  }
  const t = tones[tone];
  
  return (
    <div className="card row-center gap-4" style={{ flex: 1, minWidth: '200px' }}>
      <div style={{ width: 42, height: 42, borderRadius: 'var(--r-md)', background: t.bg, color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.acc}33` }}>
        <Icon name={icon} size={20} className={pulse ? 'pulse-dot' : ''} />
      </div>
      <div className="col">
        <span className="eyebrow">{label}</span>
        <span className="text-display" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{value}</span>
      </div>
    </div>
  )
}

const kpiGrid = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '1.5rem',
  flexWrap: 'wrap'
}
