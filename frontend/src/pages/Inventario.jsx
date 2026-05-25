import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getInventario, getAlertas, createItem, updateStock } from '../api/inventario.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'

export default function Inventario() {
  const [items, setItems] = useState([])
  const [alertas, setAlertas] = useState([])
  const [modal, setModal] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const { register, handleSubmit, reset } = useForm()
  const stockForm = useForm()

  const reload = () => {
    getInventario().then((r) => setItems(r.data)).catch(() => {})
    getAlertas().then((r) => setAlertas(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }

  useEffect(reload, [])

  async function onCreateItem(data) {
    await createItem(data)
    reset()
    setModal(null)
    reload()
  }

  async function onUpdateStock(data) {
    await updateStock(editItem.id_item, data)
    stockForm.reset()
    setModal(null)
    reload()
  }

  const columns = useMemo(() => [
    { header: 'Nombre', accessorKey: 'nombre_item' },
    { header: 'Tipo', accessorKey: 'tipo_item' },
    { 
      header: 'Stock', 
      accessorKey: 'cantidad_stock',
      cell: info => <span style={{ fontWeight: 700, color: info.getValue() < 10 ? '#dc2626' : '#16a34a' }}>{info.getValue()}</span>
    },
    { header: 'Unidad', accessorFn: row => row.unidad ?? row.abreviatura ?? '—' },
    { 
      header: 'Estado', 
      accessorKey: 'estado_item',
      cell: info => {
        const estado = info.getValue()
        return (
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', background: estado === 'Disponible' ? '#dcfce7' : (estado === 'Agotado' ? '#fee2e2' : '#f3f4f6'), color: estado === 'Disponible' ? '#166534' : (estado === 'Agotado' ? '#991b1b' : '#6b7280') }}>
            {estado}
          </span>
        )
      }
    },
    {
      header: 'Acción',
      id: 'accion',
      cell: info => {
        const item = info.row.original;
        return (
          <button onClick={() => { setEditItem(item); stockForm.setValue('cantidad_stock', item.cantidad_stock); setModal('stock') }}
            style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff' }}>
            Actualizar stock
          </button>
        )
      }
    }
  ], [])

  return (
    <div>
      <PageHeader title="Inventario">
        <button style={btnPrimary} onClick={() => setModal('nuevo')}>+ Nuevo item</button>
      </PageHeader>

      {alertas.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <strong>Alertas de stock bajo:</strong> {alertas.map((a) => a.descripcion ?? a.nombre).join(', ')}
        </div>
      )}

      <div style={card}>
        <DataTable data={items} columns={columns} />
      </div>

      {modal === 'nuevo' && (
        <Modal title="Nuevo item de inventario" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onCreateItem)}>
            <FormField label="Nombre"><input style={inputStyle} {...register('nombre_item', { required: true })} /></FormField>
            <FormField label="Tipo">
              <select style={inputStyle} {...register('id_tipo_item', { required: true })}>
                <option value="1">Alimento Concentrado</option>
                <option value="2">Medicamento</option>
                <option value="3">Suplemento</option>
              </select>
            </FormField>
            <FormField label="Stock inicial"><input style={inputStyle} type="number" step="0.01" {...register('cantidad_stock', { required: true })} /></FormField>
            <FormField label="Unidad Base">
              <select style={inputStyle} {...register('id_unidad_base', { required: true })}>
                <option value="1">Kilogramos (kg)</option>
                <option value="2">Gramos (g)</option>
                <option value="3">Litros (L)</option>
                <option value="4">Unidades (und)</option>
              </select>
            </FormField>
            <FormField label="Estado">
              <select style={inputStyle} {...register('estado_item', { required: true })}>
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
                <option value="Descontinuado">Descontinuado</option>
              </select>
            </FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Crear</button>
          </form>
        </Modal>
      )}

      {modal === 'stock' && editItem && (
        <Modal title={`Actualizar stock — ${editItem.nombre_item}`} onClose={() => setModal(null)}>
          <form onSubmit={stockForm.handleSubmit(onUpdateStock)}>
            <FormField label="Nuevo stock"><input style={inputStyle} type="number" step="0.01" {...stockForm.register('cantidad_stock', { required: true })} /></FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}