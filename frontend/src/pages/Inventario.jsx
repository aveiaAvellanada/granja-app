import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getInventario, getAlertas, createItem, updateStock } from '../api/inventario.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import FormField, { inputStyle, btnPrimary, card } from '../components/FormField.jsx'

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

  return (
    <div>
      <PageHeader title="Inventario">
        <button style={btnPrimary} onClick={() => setModal('nuevo')}>+ Nuevo item</button>
      </PageHeader>

      {alertas.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <strong>Alertas de stock bajo:</strong> {alertas.map((a) => a.nombre).join(', ')}
        </div>
      )}

      <div style={card}>
        <table>
          <thead>
            <tr><th>Nombre</th><th>Tipo</th><th>Stock</th><th>Unidad</th><th>Precio unit.</th><th>Acción</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id_item}>
                <td>{item.nombre}</td>
                <td>{item.tipo}</td>
                <td style={{ fontWeight: 700, color: item.stock < 10 ? '#dc2626' : '#16a34a' }}>{item.stock}</td>
                <td>{item.unidad ?? item.nombre_unidad ?? '—'}</td>
                <td>{item.precio_unitario ?? '—'}</td>
                <td>
                  <button onClick={() => { setEditItem(item); stockForm.setValue('stock', item.stock); setModal('stock') }}
                    style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff' }}>
                    Actualizar stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'nuevo' && (
        <Modal title="Nuevo item de inventario" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onCreateItem)}>
            <FormField label="Nombre"><input style={inputStyle} {...register('nombre', { required: true })} /></FormField>
            <FormField label="Tipo"><input style={inputStyle} {...register('tipo')} /></FormField>
            <FormField label="Stock inicial"><input style={inputStyle} type="number" {...register('stock', { required: true })} /></FormField>
            <FormField label="ID Unidad"><input style={inputStyle} type="number" {...register('id_unidad')} /></FormField>
            <FormField label="Precio unitario"><input style={inputStyle} type="number" step="0.01" {...register('precio_unitario')} /></FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Crear</button>
          </form>
        </Modal>
      )}

      {modal === 'stock' && editItem && (
        <Modal title={`Actualizar stock — ${editItem.nombre}`} onClose={() => setModal(null)}>
          <form onSubmit={stockForm.handleSubmit(onUpdateStock)}>
            <FormField label="Nuevo stock"><input style={inputStyle} type="number" {...stockForm.register('stock', { required: true })} /></FormField>
            <button type="submit" style={{ ...btnPrimary, width: '100%' }}>Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
