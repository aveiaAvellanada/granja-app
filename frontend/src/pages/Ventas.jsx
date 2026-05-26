import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getVentas, registrarVenta, anularFactura, getDetalleVenta } from '../api/ventas.api.js'
import { buscarClientes } from '../api/clientes.api.js'
import { getCerdos } from '../api/cerdos.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import { btnPrimary, btnDanger, card } from '../components/FormField.jsx'
import DataTable from '../components/DataTable.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ExportButton from '../components/ExportButton'

const formatMoneda = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val)

const formatearFechaLarga = (fechaStr) => {
  if (!fechaStr) return '—'
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(fechaStr).toLocaleDateString('es-CO', opciones)
}

export default function Ventas() {
  const { user } = useAuth()
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // States for standard page modals
  const [detalleModal, setDetalleModal] = useState(null)
  const [detalleInfo, setDetalleInfo] = useState([])
  const [confirmAnularId, setConfirmAnularId] = useState(null)
  
  // States for Nueva Venta
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false)
  const [searchCedula, setSearchCedula] = useState('')
  const [clientResults, setClientResults] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  
  const [availablePigs, setAvailablePigs] = useState([])
  const [pigSearch, setPigSearch] = useState('')
  
  // Available pigs interaction
  const [checkedPigs, setCheckedPigs] = useState({})
  const [pendingPrices, setPendingPrices] = useState({})
  
  // Cart
  const [cart, setCart] = useState([])
  const [editingCartId, setEditingCartId] = useState(null)
  const [editingCartPrice, setEditingCartPrice] = useState('')

  const [newSaleError, setNewSaleError] = useState('')
  const [successInvoice, setSuccessInvoice] = useState(null)
  const [confirmCloseModal, setConfirmCloseModal] = useState(false)

  const reload = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getVentas()
      setVentas(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  // --- Nueva Venta Handlers ---
  
  useEffect(() => {
    if (isNewSaleOpen) {
      getCerdos().then(r => setAvailablePigs(r.data)).catch(() => {})
    }
  }, [isNewSaleOpen])

  useEffect(() => {
    if (searchCedula.trim().length > 0) {
      const timer = setTimeout(() => {
        buscarClientes(searchCedula).then(r => setClientResults(r.data)).catch(() => {})
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setClientResults([])
    }
  }, [searchCedula])

  const handleSelectClient = (c) => {
    setSelectedClient(c)
    setSearchCedula('')
    setClientResults([])
  }

  const handleClearClient = () => {
    setSelectedClient(null)
  }

  // Pigs Interaction
  const toggleCheck = (id_cerdo) => {
    setCheckedPigs(prev => ({
      ...prev,
      [id_cerdo]: !prev[id_cerdo]
    }))
  }

  const addToCart = (pig, priceStr) => {
    const price = parseFloat(priceStr)
    if (isNaN(price) || price <= 0) return

    setCart(prev => [...prev, {
      id_cerdo: pig.id_cerdo,
      raza: pig.raza,
      peso: pig.ultimo_peso_kg,
      precio: price
    }])

    // Reset interactions for this row
    setCheckedPigs(prev => ({...prev, [pig.id_cerdo]: false}))
    setPendingPrices(prev => ({...prev, [pig.id_cerdo]: ''}))
  }

  const removeFromCart = (id_cerdo) => {
    setCart(prev => prev.filter(c => c.id_cerdo !== id_cerdo))
  }

  const startEditPrice = (cartItem) => {
    setEditingCartId(cartItem.id_cerdo)
    setEditingCartPrice(cartItem.precio.toString())
  }

  const saveEditPrice = (id_cerdo) => {
    const newPrice = parseFloat(editingCartPrice)
    if (!isNaN(newPrice) && newPrice > 0) {
      setCart(prev => prev.map(c => c.id_cerdo === id_cerdo ? { ...c, precio: newPrice } : c))
    }
    setEditingCartId(null)
    setEditingCartPrice('')
  }

  const filteredPigs = availablePigs.filter(p => 
    p.id_cerdo.toString().includes(pigSearch) || 
    (p.raza && p.raza.toLowerCase().includes(pigSearch.toLowerCase()))
  )

  const cartTotal = cart.reduce((acc, c) => acc + c.precio, 0)

  let validationMsg = "";
  if (!selectedClient) {
    validationMsg = "Selecciona un cliente para continuar.";
  } else if (cart.length === 0) {
    validationMsg = "Agrega al menos un cerdo al carrito.";
  } else if (cart.some(c => c.precio <= 0)) {
    validationMsg = "Todos los precios deben ser mayores a 0.";
  }
  const isSaleValid = !validationMsg;

  const handleRegisterSale = async () => {
    setNewSaleError('')
    if (!isSaleValid) return

    const payload = {
      id_cliente: selectedClient.id_cliente,
      // id_empleado is securely handled by backend from JWT (req.user.id)
      ids_cerdos: cart.map(c => c.id_cerdo),
      precios: cart.map(c => c.precio)
    }

    try {
      const res = await registrarVenta(payload)
      forceCloseNewSale()
      setSuccessInvoice(res.data.id_factura)
      reload()
    } catch (err) {
      setNewSaleError(err.response?.data?.error || 'Error al registrar la venta')
    }
  }

  const requestCloseNewSale = () => {
    if (cart.length > 0) {
      setConfirmCloseModal(true)
    } else {
      forceCloseNewSale()
    }
  }

  const forceCloseNewSale = () => {
    setIsNewSaleOpen(false)
    setSelectedClient(null)
    setCart([])
    setCheckedPigs({})
    setPendingPrices({})
    setSearchCedula('')
    setNewSaleError('')
    setConfirmCloseModal(false)
  }

  // --- Existing Handlers ---

  async function handleAnular() {
    await anularFactura(confirmAnularId)
    setConfirmAnularId(null)
    setDetalleModal(null)
    reload()
  }

  async function handleVerDetalle(id) {
    try {
      const r = await getDetalleVenta(id)
      setDetalleInfo(r.data)
      setDetalleModal(id)
    } catch (err) {
      console.error(err)
    }
  }

  const columns = useMemo(() => [
    { header: 'Factura', accessorKey: 'id_factura', cell: info => `#${info.getValue()}` },
    { header: 'Cliente', accessorFn: row => row.cliente ?? row.id_cliente },
    { header: 'Empleado', accessorFn: row => row.empleado ?? row.id_empleado },
    { header: 'Total', accessorFn: row => row.total_cop, cell: info => <span style={{ fontWeight: 700 }}>{formatMoneda(info.getValue() ?? 0)}</span> },
    { header: 'Fecha', accessorKey: 'fecha_venta', cell: info => info.getValue()?.slice(0, 10) },
    { 
      header: 'Estado', 
      accessorKey: 'estado_factura',
      cell: info => {
        const estado = info.getValue() ?? 'Pendiente';
        const bg = estado === 'Completada' ? '#dcfce7' : estado === 'Anulada' ? '#fee2e2' : '#fef3c7';
        const fg = estado === 'Completada' ? '#166534' : estado === 'Anulada' ? '#991b1b' : '#92400e';
        return (
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', background: bg, color: fg }}>
            {estado}
          </span>
        )
      }
    },
    {
      header: 'Acción',
      id: 'accion',
      cell: info => {
        const v = info.row.original;
        return (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => handleVerDetalle(v.id_factura)} style={{ ...btnPrimary, fontSize: '0.78rem', padding: '3px 8px' }}>
              Ver Detalle
            </button>
            {v.estado_factura === 'Completada' && (
              <button onClick={() => setConfirmAnularId(v.id_factura)} style={{ ...btnDanger, fontSize: '0.78rem', padding: '3px 8px' }}>
                Anular
              </button>
            )}
          </div>
        )
      }
    }
  ], [])

  const primerDetalle = detalleInfo.length > 0 ? detalleInfo[0] : null;
  const totalFactura = detalleInfo.reduce((acc, d) => acc + Number(d.precio_venta_cop), 0);

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #seccion-impresion, #seccion-impresion * { visibility: visible; }
          #seccion-impresion { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      </style>
      <PageHeader title="Ventas">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ExportButton data={ventas} filename="Ventas" />
          <button style={btnPrimary} onClick={() => setIsNewSaleOpen(true)}>+ Nueva venta</button>
        </div>
      </PageHeader>

      {loading ? (
        <LoadingSpinner message="Cargando ventas..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <div style={card}>
          <DataTable data={ventas} columns={columns} />
        </div>
      )}

      {isNewSaleOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#f9fafb', borderRadius: '8px', width: '95%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
            <div style={{ padding: '1.25rem 2rem', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#111827' }}>Registrar Nueva Venta</h2>
              <button onClick={requestCloseNewSale} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* SECCION 1 - CLIENTE */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>1. Búsqueda de Cliente</h3>
                  
                  {!selectedClient ? (
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Buscar por cédula</label>
                      <input 
                        type="text" 
                        maxLength={12}
                        value={searchCedula}
                        onChange={(e) => setSearchCedula(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej: 1020..."
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      />
                      {clientResults.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                          {clientResults.map(c => (
                            <div 
                              key={c.id_cliente} 
                              onClick={() => handleSelectClient(c)}
                              style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                            >
                              <div style={{ fontWeight: 600 }}>{c.p_nombre} {c.p_apellido}</div>
                              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>C.C. {c.cedula_cliente}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', position: 'relative' }}>
                      <button 
                        onClick={handleClearClient}
                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer' }}
                        title="Limpiar cliente"
                      >
                        &times;
                      </button>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{selectedClient.p_nombre} {selectedClient.s_nombre ?? ''} {selectedClient.p_apellido} {selectedClient.s_apellido ?? ''}</div>
                      <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>C.C. {selectedClient.cedula_cliente}</div>
                      <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>Tel: {selectedClient.telefono ?? '—'}</div>
                      <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>Correo: {selectedClient.correo_cliente ?? '—'}</div>
                    </div>
                  )}
                </div>

                {/* SECCION 2 - EMPLEADO */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>2. Empleado Vendedor</h3>
                  <div style={{ background: '#f3f4f6', border: '1px dashed #d1d5db', borderRadius: '6px', padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{user?.nombre}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Autenticado automáticamente (ID oculto)</div>
                  </div>
                </div>
              </div>

              {/* SECCION 3 - CERDOS DISPONIBLES */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#374151' }}>3. Cerdos Disponibles</h3>
                  <input 
                    type="text" 
                    placeholder="Filtrar por ID o Raza..." 
                    value={pigSearch}
                    onChange={(e) => setPigSearch(e.target.value)}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', width: '250px' }}
                  />
                </div>
                
                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem' }}>Sel.</th>
                        <th style={{ padding: '0.75rem' }}>ID</th>
                        <th style={{ padding: '0.75rem' }}>Sexo</th>
                        <th style={{ padding: '0.75rem' }}>Raza</th>
                        <th style={{ padding: '0.75rem' }}>Edad</th>
                        <th style={{ padding: '0.75rem' }}>Último peso</th>
                        <th style={{ padding: '0.75rem', width: '220px' }}>Precio Venta (COP)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPigs.map(p => {
                        const inCart = cart.some(c => c.id_cerdo === p.id_cerdo);
                        const isChecked = !!checkedPigs[p.id_cerdo];
                        const pendingPrice = pendingPrices[p.id_cerdo] || '';
                        
                        return (
                          <tr key={p.id_cerdo} style={{ borderBottom: '1px solid #f3f4f6', background: inCart ? '#f9fafb' : (isChecked ? '#eff6ff' : 'transparent'), opacity: inCart ? 0.6 : 1 }}>
                            <td style={{ padding: '0.75rem' }}>
                              <input 
                                type="checkbox" 
                                checked={inCart || isChecked}
                                disabled={inCart}
                                onChange={() => toggleCheck(p.id_cerdo)} 
                                style={{ width: '18px', height: '18px', cursor: inCart ? 'not-allowed' : 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>#{p.id_cerdo}</td>
                            <td style={{ padding: '0.75rem' }}>{p.sexo_cerdo}</td>
                            <td style={{ padding: '0.75rem' }}>{p.raza ?? '—'}</td>
                            <td style={{ padding: '0.75rem' }}>{p.edad_dias ?? '—'} días</td>
                            <td style={{ padding: '0.75rem' }}>{p.ultimo_peso_kg ?? '—'} kg</td>
                            <td style={{ padding: '0.75rem' }}>
                              {inCart ? (
                                <button disabled style={{ padding: '0.35rem 0.75rem', background: '#e5e7eb', color: '#6b7280', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'not-allowed' }}>
                                  En carrito
                                </button>
                              ) : (
                                isChecked && (
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input 
                                      type="number" 
                                      value={pendingPrice}
                                      onChange={(e) => setPendingPrices(prev => ({...prev, [p.id_cerdo]: e.target.value}))}
                                      placeholder="Ej: 850000"
                                      min="1"
                                      style={{ width: '100px', padding: '0.35rem', border: '1px solid #93c5fd', borderRadius: '4px' }}
                                    />
                                    {parseFloat(pendingPrice) > 0 && (
                                      <button onClick={() => addToCart(p, pendingPrice)} style={{ padding: '0.35rem 0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                                        Agregar
                                      </button>
                                    )}
                                  </div>
                                )
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      {filteredPigs.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No se encontraron cerdos activos.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECCION 4 - CARRITO DE VENTA */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>4. Carrito de Venta</h3>
                
                {cart.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', border: '1px dashed #d1d5db', borderRadius: '6px' }}>
                    El carrito está vacío. Selecciona cerdos en la tabla superior, asigna un precio y haz clic en "Agregar".
                  </div>
                ) : (
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: '#f9fafb' }}>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '0.75rem' }}>#</th>
                          <th style={{ padding: '0.75rem' }}>ID Cerdo</th>
                          <th style={{ padding: '0.75rem' }}>Raza</th>
                          <th style={{ padding: '0.75rem' }}>Peso (kg)</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right' }}>Precio COP</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((c, idx) => (
                          <tr key={c.id_cerdo} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '0.75rem', color: '#6b7280' }}>{idx + 1}</td>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>#{c.id_cerdo}</td>
                            <td style={{ padding: '0.75rem' }}>{c.raza ?? '—'}</td>
                            <td style={{ padding: '0.75rem' }}>{c.peso ?? '—'}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                              {editingCartId === c.id_cerdo ? (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                  <input 
                                    type="number" 
                                    value={editingCartPrice}
                                    onChange={(e) => setEditingCartPrice(e.target.value)}
                                    style={{ width: '100px', padding: '0.25rem', border: '1px solid #3b82f6', borderRadius: '4px' }}
                                  />
                                  <button onClick={() => saveEditPrice(c.id_cerdo)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>✓</button>
                                </div>
                              ) : (
                                formatMoneda(c.precio)
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              {editingCartId !== c.id_cerdo && (
                                <>
                                  <button onClick={() => startEditPrice(c)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '0.75rem', fontSize: '1.1rem' }} title="Editar precio">✏️</button>
                                  <button onClick={() => removeFromCart(c.id_cerdo)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.1rem' }} title="Eliminar del carrito">❌</button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ padding: '1rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ color: '#4b5563', fontWeight: 600 }}>Cerdos seleccionados: {cart.length}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>Total: {formatMoneda(cartTotal)}</div>
                    </div>
                  </div>
                )}
              </div>

              {newSaleError && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '6px', fontWeight: 600 }}>
                  Error: {newSaleError}
                </div>
              )}
            </div>

            <div style={{ padding: '1.5rem 2rem', background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {!isSaleValid && (
                  <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.9rem' }}>⚠️ {validationMsg}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={requestCloseNewSale} style={{ padding: '0.75rem 1.5rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                  Cancelar
                </button>
                <button 
                  onClick={handleRegisterSale} 
                  disabled={!isSaleValid}
                  style={{ padding: '0.75rem 2rem', background: isSaleValid ? '#2563eb' : '#9ca3af', border: 'none', borderRadius: '4px', cursor: isSaleValid ? 'pointer' : 'not-allowed', fontWeight: 600, color: '#fff', transition: 'background 0.2s' }}
                >
                  Registrar Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successInvoice && (
        <Modal title="¡Venta Exitosa!" onClose={() => setSuccessInvoice(null)}>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#111827', fontSize: '1.25rem' }}>Venta registrada — Factura #{successInvoice}</h3>
            <p style={{ color: '#4b5563', marginBottom: '2rem' }}>La transacción se ha almacenado correctamente.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setSuccessInvoice(null)} style={{ padding: '0.75rem 1.5rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                Cerrar
              </button>
              <button 
                onClick={() => {
                  const id = successInvoice;
                  setSuccessInvoice(null);
                  handleVerDetalle(id);
                }} 
                style={{ ...btnPrimary, padding: '0.75rem 1.5rem' }}
              >
                Ver factura
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detalle Factura Modal */}
      {detalleModal && primerDetalle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '95%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div id="seccion-impresion" style={{ padding: '2rem', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: '#111827' }}>Factura #{detalleModal}</h1>
                  <div style={{ color: '#6b7280' }}>Emitida: {formatearFechaLarga(primerDetalle.fecha_venta)}</div>
                </div>
                <div>
                  {(() => {
                    const st = primerDetalle.estado_factura;
                    const bg = st === 'Completada' ? '#dcfce7' : st === 'Anulada' ? '#fee2e2' : '#fef3c7';
                    const fg = st === 'Completada' ? '#166534' : st === 'Anulada' ? '#991b1b' : '#92400e';
                    return <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.9rem', fontWeight: 600, background: bg, color: fg }}>{st}</span>
                  })()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#374151' }}>Datos del Cliente</h3>
                  <div style={{ color: '#4b5563', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 600 }}>{primerDetalle.nombre_cliente}</div>
                    <div>Cédula: {primerDetalle.cedula_cliente}</div>
                    <div>Tel: {primerDetalle.telefono_cliente ?? 'N/A'}</div>
                    <div>Email: {primerDetalle.correo_cliente ?? 'N/A'}</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#374151' }}>Datos del Empleado</h3>
                  <div style={{ color: '#4b5563', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 600 }}>{primerDetalle.nombre_empleado}</div>
                  </div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>#</th>
                    <th style={{ padding: '0.75rem 1rem' }}>ID Cerdo</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Sexo</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Raza</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Precio de Venta</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleInfo.map((d, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>#{d.id_cerdo}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{d.sexo_cerdo}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{d.raza}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{formatMoneda(d.precio_venta_cop)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '2px solid #e5e7eb' }}>
                <div style={{ width: '300px', fontSize: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#4b5563' }}>Cant. Animales:</span>
                    <span style={{ fontWeight: 600 }}>{detalleInfo.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
                    <span>Total General:</span>
                    <span>{formatMoneda(totalFactura)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print" style={{ padding: '1rem 2rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setDetalleModal(null)} style={{ padding: '0.5rem 1.5rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                Cerrar
              </button>
              <button onClick={() => window.print()} style={{ padding: '0.5rem 1.5rem', background: '#3b82f6', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#fff' }}>
                Imprimir
              </button>
              {primerDetalle.estado_factura === 'Completada' && (
                <button onClick={() => setConfirmAnularId(detalleModal)} style={{ padding: '0.5rem 1.5rem', background: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: '#fff' }}>
                  Anular factura
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmCloseModal}
        title="Cancelar venta"
        message="Tienes cerdos en el carrito. ¿Seguro que deseas cerrar sin guardar? Se perderá todo el progreso."
        confirmColor="red"
        onConfirm={forceCloseNewSale}
        onCancel={() => setConfirmCloseModal(false)}
      />

      <ConfirmModal
        isOpen={!!confirmAnularId}
        title="Anular factura"
        message={`¿Seguro que deseas anular la factura #${confirmAnularId}? Los cerdos vendidos volverán a estado Activo y la factura quedará marcada como Anulada.`}
        confirmColor="red"
        onConfirm={handleAnular}
        onCancel={() => setConfirmAnularId(null)}
      />
    </div>
  )
}