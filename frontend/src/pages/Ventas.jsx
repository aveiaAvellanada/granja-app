import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getVentas, registrarVenta, anularFactura, getDetalleVenta, getCerdosVendibles } from '../api/ventas.api.js'
import { buscarClientes } from '../api/clientes.api.js'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import DataTable from '../components/DataTable.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ExportButton from '../components/ExportButton'
import { Icon } from '../components/Icon.jsx'

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
      getCerdosVendibles().then(r => setAvailablePigs(r.data)).catch(() => {})
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
    { header: 'Factura', accessorKey: 'id_factura', cell: info => <span className="text-mono">#{info.getValue()}</span> },
    { header: 'Cliente / Receptor', accessorFn: row => row.cliente ?? row.id_cliente, cell: info => <span className="text-strong">{info.getValue()}</span> },
    { header: 'Vendedor', accessorFn: row => row.empleado ?? row.id_empleado, cell: info => <span className="text-muted">{info.getValue()}</span> },
    { header: 'Monto Total', accessorFn: row => row.total_cop, cell: info => <span className="text-strong" style={{ fontSize: '1rem' }}>{formatMoneda(info.getValue() ?? 0)}</span> },
    { header: 'Fecha Emisión', accessorKey: 'fecha_venta', cell: info => <span className="text-muted">{info.getValue()?.slice(0, 10)}</span> },
    { 
      header: 'Estado', 
      accessorKey: 'estado_factura',
      cell: info => {
        const estado = info.getValue() ?? 'Pendiente';
        let cls = 'badge-mono';
        if (estado === 'Completada') cls = 'badge-success';
        if (estado === 'Anulada') cls = 'badge-danger';
        return <span className={`badge ${cls}`}>{estado}</span>
      }
    },
    {
      header: 'Acciones',
      id: 'accion',
      cell: info => {
        const v = info.row.original;
        return (
          <div className="row gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => handleVerDetalle(v.id_factura)}>
              <Icon name="receipt" size={14} /> Detalle
            </button>
            {v.estado_factura === 'Completada' && (
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rust)' }} onClick={() => setConfirmAnularId(v.id_factura)}>
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
    <div className="page-animate">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #seccion-impresion, #seccion-impresion * { visibility: visible; }
          #seccion-impresion { position: absolute; left: 0; top: 0; width: 100%; padding: 0; background: #fff; }
          .no-print { display: none !important; }
          .card { border: none !important; box-shadow: none !important; }
        }
      `}</style>

      <PageHeader title="Ventas y Facturación" icon={<Icon name="receipt" size={20} />}>
        <div className="row gap-2">
          <ExportButton data={ventas} filename="Ventas_Export" />
          <button className="btn btn-primary" onClick={() => setIsNewSaleOpen(true)}>
            <Icon name="plus" size={14} /> Nueva operación
          </button>
        </div>
      </PageHeader>

      {loading ? (
        <LoadingSpinner message="Consultando historial transaccional..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable data={ventas} columns={columns} />
        </div>
      )}

      {/* MODAL NUEVA VENTA - REDISEÑADO TIPO DRAWER CENTRADO */}
      {isNewSaleOpen && (
        <div style={overlay} onClick={requestCloseNewSale}>
          <div style={saleDrawer} onClick={e => e.stopPropagation()}>
            
            <div style={drawerHead}>
              <div className="col">
                <h2 style={{ fontSize: '1.5rem' }}>Registro de Nueva Venta</h2>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Diligencia los datos del cliente y selecciona los animales.</p>
              </div>
              <button className="btn btn-ghost" onClick={requestCloseNewSale} style={{ padding: 8 }}>
                <Icon name="logout" size={20} />
              </button>
            </div>

            <div style={drawerBody} className="scroll-dark col gap-6">
              
              <div className="row gap-6">
                {/* SECCION 1 - CLIENTE */}
                <div className="card col gap-4" style={{ flex: 1 }}>
                  <h4 className="section-title"><span className="dot" />1. Datos del Receptor</h4>
                  
                  {!selectedClient ? (
                    <div className="col gap-2">
                      <label className="eyebrow">Búsqueda por Identificación</label>
                      <div style={{ position: 'relative' }}>
                        <Icon name="search" size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
                        <input 
                          className="input"
                          type="text" 
                          maxLength={12}
                          value={searchCedula}
                          onChange={(e) => setSearchCedula(e.target.value.replace(/\D/g, ''))}
                          placeholder="Cédula del cliente..."
                          style={{ paddingLeft: 36 }}
                        />
                        {clientResults.length > 0 && (
                          <div style={resultsFloat}>
                            {clientResults.map(c => (
                              <div key={c.id_cliente} onClick={() => handleSelectClient(c)} style={resultItem}>
                                <div className="text-strong">{c.p_nombre} {c.p_apellido}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>C.C. {c.cedula_cliente}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="card-accent card-tight row-between">
                      <div className="col">
                        <div className="text-strong" style={{ fontSize: '1rem' }}>{selectedClient.p_nombre} {selectedClient.p_apellido}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>C.C. {selectedClient.cedula_cliente} • {selectedClient.telefono || 'Sin tel.'}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={handleClearClient} style={{ color: 'var(--rust)' }}>
                        <Icon name="logout" size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* SECCION 2 - RESPONSABLE */}
                <div className="card col gap-4" style={{ flex: 1 }}>
                  <h4 className="section-title"><span className="dot" />2. Responsable de Operación</h4>
                  <div className="card-tight row-center gap-3" style={{ background: 'var(--surface-sunken)', borderStyle: 'dashed' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="user" size={14} color="var(--green-ink)" />
                    </div>
                    <div className="col">
                      <div className="text-strong">{user?.nombre}</div>
                      <div className="eyebrow" style={{ fontSize: '0.6rem' }}>Usuario en sesión</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCION 3 - CERDOS DISPONIBLES */}
              <div className="card col gap-4">
                <div className="row-between">
                  <h4 className="section-title" style={{ margin: 0 }}><span className="dot" />3. Selección de Inventario Activo</h4>
                  <div style={{ position: 'relative' }}>
                    <Icon name="search" size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
                    <input 
                      className="input input-sm"
                      type="text" 
                      placeholder="Filtrar por ID o Raza..." 
                      value={pigSearch}
                      onChange={(e) => setPigSearch(e.target.value)}
                      style={{ width: 220, paddingLeft: 34, paddingRight: 10, paddingTop: 6, paddingBottom: 6 }}
                    />
                  </div>
                </div>
                
                <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)' }} className="scroll-dark">
                  <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr style={{ background: 'var(--surface-2)' }}>
                        <th style={{ width: 40 }}>Sel.</th>
                        <th>ID</th>
                        <th>Raza / Genética</th>
                        <th>Peso (kg)</th>
                        <th>Edad</th>
                        <th style={{ width: 240 }}>Precio Pactado (COP)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPigs.map(p => {
                        const inCart = cart.some(c => c.id_cerdo === p.id_cerdo);
                        const isChecked = !!checkedPigs[p.id_cerdo];
                        const pendingPrice = pendingPrices[p.id_cerdo] || '';
                        
                        return (
                          <tr key={p.id_cerdo} style={{ opacity: inCart ? 0.5 : 1, background: isChecked ? 'var(--green-soft)' : 'transparent' }}>
                            <td>
                              <input 
                                type="checkbox" 
                                checked={inCart || isChecked}
                                disabled={inCart}
                                onChange={() => toggleCheck(p.id_cerdo)} 
                                style={{ cursor: inCart ? 'not-allowed' : 'pointer' }}
                              />
                            </td>
                            <td><span className="text-mono text-strong">#{p.id_cerdo}</span></td>
                            <td>{p.raza || 'Común'}</td>
                            <td><span className="text-strong">{p.ultimo_peso_kg || '—'}</span></td>
                            <td className="text-muted" style={{ fontSize: '0.8rem' }}>{p.edad_dias} días</td>
                            <td>
                              {inCart ? (
                                <span className="badge badge-success">Agregado</span>
                              ) : (
                                isChecked && (
                                  <div className="row gap-2">
                                    <input 
                                      className="input input-sm text-mono"
                                      type="number" 
                                      value={pendingPrice}
                                      onChange={(e) => setPendingPrices(prev => ({...prev, [p.id_cerdo]: e.target.value}))}
                                      placeholder="Monto..."
                                      style={{ width: 110, padding: '4px 8px' }}
                                    />
                                    <button 
                                      className="btn btn-primary btn-sm" 
                                      disabled={!pendingPrice || parseFloat(pendingPrice) <= 0}
                                      onClick={() => addToCart(p, pendingPrice)}
                                    >
                                      Agregar
                                    </button>
                                  </div>
                                )
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECCION 4 - CARRITO DE VENTA */}
              <div className="card col gap-4">
                <h4 className="section-title"><span className="dot" />4. Resumen de Operación (Carrito)</h4>
                
                {cart.length === 0 ? (
                  <div style={emptyCart}>
                    <Icon name="receipt" size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>No se han seleccionado animales para la venta.</p>
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                    <table style={{ borderCollapse: 'separate' }}>
                      <thead style={{ background: 'var(--surface-2)' }}>
                        <tr>
                          <th style={{ width: 40 }}>#</th>
                          <th>Animal</th>
                          <th>Detalle</th>
                          <th style={{ textAlign: 'right' }}>Precio Unitario</th>
                          <th style={{ textAlign: 'center', width: 100 }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((c, idx) => (
                          <tr key={c.id_cerdo}>
                            <td className="text-muted">{idx + 1}</td>
                            <td><span className="text-strong">Cerdo #{c.id_cerdo}</span></td>
                            <td className="text-muted" style={{ fontSize: '0.8rem' }}>{c.raza || 'N/A'} • {c.peso} kg</td>
                            <td style={{ textAlign: 'right' }}>
                              {editingCartId === c.id_cerdo ? (
                                <div className="row gap-1" style={{ justifyContent: 'flex-end' }}>
                                  <input 
                                    className="input input-sm text-mono"
                                    type="number" 
                                    value={editingCartPrice}
                                    onChange={(e) => setEditingCartPrice(e.target.value)}
                                    style={{ width: 110, padding: '4px 8px' }}
                                    autoFocus
                                  />
                                  <button className="btn btn-primary btn-sm" onClick={() => saveEditPrice(c.id_cerdo)} style={{ padding: '4px 8px' }}>
                                    <Icon name="plus" size={12} />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-strong">{formatMoneda(c.precio)}</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {editingCartId !== c.id_cerdo && (
                                <div className="row-center gap-2" style={{ justifyContent: 'center' }}>
                                  <button className="btn btn-ghost btn-sm" onClick={() => startEditPrice(c)} title="Editar precio">
                                    <Icon name="clipboard" size={14} color="var(--info)" />
                                  </button>
                                  <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(c.id_cerdo)} title="Quitar">
                                    <Icon name="logout" size={14} color="var(--rust)" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={cartTotalRow}>
                      <div className="row-center gap-2">
                        <span className="badge badge-mono">{cart.length} animales</span>
                      </div>
                      <div className="row-center gap-4">
                        <span className="eyebrow" style={{ marginTop: 4 }}>Total a Facturar:</span>
                        <span className="text-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--forest)' }}>{formatMoneda(cartTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {newSaleError && (
                <div className="badge badge-danger" style={{ width: '100%', padding: 12, borderRadius: 'var(--r-md)', textTransform: 'none', justifyContent: 'center' }}>
                  <Icon name="alert" size={16} /> <strong>Error:</strong> {newSaleError}
                </div>
              )}
            </div>

            <div style={drawerFoot}>
              <div>
                {!isSaleValid && (
                  <div className="row-center gap-2" style={{ color: 'var(--rust)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Icon name="alert" size={14} /> {validationMsg}
                  </div>
                )}
              </div>
              <div className="row gap-3">
                <button className="btn btn-secondary" onClick={requestCloseNewSale} style={{ minWidth: 120 }}>Cancelar</button>
                <button 
                  className="btn btn-primary" 
                  disabled={!isSaleValid}
                  onClick={handleRegisterSale}
                  style={{ minWidth: 180, fontSize: '0.95rem' }}
                >
                  Registrar Venta <Icon name="arrow-right" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successInvoice && (
        <Modal title="Venta Confirmada" onClose={() => setSuccessInvoice(null)}>
          <div className="col gap-4" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>¡Transacción Exitosa!</h3>
              <p className="text-muted">Se ha generado la factura <span className="text-strong text-mono">#{successInvoice}</span> y se ha actualizado el inventario de animales.</p>
            </div>
            <div className="divider" />
            <div className="row gap-3" style={{ justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setSuccessInvoice(null)}>Cerrar</button>
              <button className="btn btn-primary" onClick={() => { const id = successInvoice; setSuccessInvoice(null); handleVerDetalle(id); }}>
                <Icon name="receipt" size={16} /> Visualizar Factura
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detalle Factura Modal - REDISEÑO TIPO DOCUMENTO */}
      {detalleModal && primerDetalle && (
        <div style={overlay} onClick={() => setDetalleModal(null)}>
          <div style={invoiceDoc} onClick={e => e.stopPropagation()}>
            
            <div id="seccion-impresion" style={docContent}>
              {/* Header Factura */}
              <div className="row-between" style={{ marginBottom: '2.5rem' }}>
                <div className="col gap-1">
                  <div className="row-center gap-2">
                    <div style={{ width: 32, height: 32, background: 'var(--forest)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="leaf" size={16} color="var(--amber)" />
                    </div>
                    <h1 style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>Granja La Voluntad de Dios</h1>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', marginLeft: 40 }}>Soporte Comercial de Venta de Semovientes</p>
                </div>
                <div className="col" style={{ textAlign: 'right' }}>
                  <div className="eyebrow">Factura de Venta</div>
                  <div className="text-display text-mono" style={{ fontSize: '1.5rem', fontWeight: 800 }}>#{detalleModal}</div>
                  <span className={`badge ${primerDetalle.estado_factura === 'Completada' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: 8 }}>
                    {primerDetalle.estado_factura}
                  </span>
                </div>
              </div>

              {/* Grid Datos */}
              <div style={docGrid}>
                <div className="card col gap-3">
                  <h4 className="section-title" style={{ fontSize: '0.8rem' }}><span className="dot" />Información del Adquirente</h4>
                  <div className="col gap-1">
                    <div className="text-strong" style={{ fontSize: '1rem' }}>{primerDetalle.nombre_cliente}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Identificación: <span className="text-strong">{primerDetalle.cedula_cliente}</span></div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Contacto: {primerDetalle.telefono_cliente || 'N/A'}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>E-mail: {primerDetalle.correo_cliente || 'N/A'}</div>
                  </div>
                </div>
                <div className="card col gap-3">
                  <h4 className="section-title" style={{ fontSize: '0.8rem' }}><span className="dot" />Detalles de Emisión</h4>
                  <div className="col gap-1">
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Fecha de Operación:</div>
                    <div className="text-strong">{formatearFechaLarga(primerDetalle.fecha_venta)}</div>
                    <div className="divider" style={{ margin: '8px 0' }} />
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Asesor Comercial:</div>
                    <div className="text-strong">{primerDetalle.nombre_empleado}</div>
                  </div>
                </div>
              </div>

              {/* Tabla Items */}
              <div style={{ marginTop: '2rem' }}>
                <table style={{ borderCollapse: 'separate' }}>
                  <thead style={{ background: 'var(--surface-2)' }}>
                    <tr>
                      <th style={{ padding: '12px' }}>Pos.</th>
                      <th style={{ padding: '12px' }}>Descripción del Animal</th>
                      <th style={{ padding: '12px' }}>Genética</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Base Grabable (COP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleInfo.map((d, idx) => (
                      <tr key={idx}>
                        <td className="text-muted">{idx + 1}</td>
                        <td><span className="text-strong">Ejemplar #{d.id_cerdo}</span> ({d.sexo_cerdo})</td>
                        <td className="text-muted">{d.raza}</td>
                        <td className="text-strong" style={{ textAlign: 'right' }}>{formatMoneda(d.precio_venta_cop)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="row-between" style={docFooter}>
                <div className="col gap-1" style={{ opacity: 0.6, fontSize: '0.75rem' }}>
                  <p>Esta factura constituye soporte legal de la transacción.</p>
                  <p>Documento generado por Hacienda Pro Sistema de Gestión.</p>
                </div>
                <div className="col gap-2" style={{ width: 280 }}>
                  <div className="row-between">
                    <span className="text-muted">Cantidad Animales:</span>
                    <span className="text-strong">{detalleInfo.length} und</span>
                  </div>
                  <div className="divider" style={{ margin: '8px 0' }} />
                  <div className="row-between">
                    <span className="text-display" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total Facturado:</span>
                    <span className="text-display" style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--forest)' }}>{formatMoneda(totalFactura)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Botones */}
            <div className="no-print row-between" style={docActions}>
              <button className="btn btn-secondary" onClick={() => setDetalleModal(null)}>Regresar</button>
              <div className="row gap-3">
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  <Icon name="clipboard" size={16} /> Imprimir Comprobante
                </button>
                {primerDetalle.estado_factura === 'Completada' && (
                  <button className="btn btn-ghost" style={{ color: 'var(--rust)' }} onClick={() => setConfirmAnularId(detalleModal)}>
                    Anular Factura
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmCloseModal}
        title="Cancelar operación"
        message="Tienes elementos en el carrito. ¿Seguro que deseas abortar el registro de venta? Se perderán todos los datos ingresados."
        confirmColor="red"
        onConfirm={forceCloseNewSale}
        onCancel={() => setConfirmCloseModal(false)}
      />

      <ConfirmModal
        isOpen={!!confirmAnularId}
        title="Anulación de Documento"
        message={`¿Confirma la anulación de la factura #${confirmAnularId}? Esta acción revertirá el estado de los animales a 'Activo' y es un evento auditable.`}
        confirmColor="red"
        onConfirm={handleAnular}
        onCancel={() => setConfirmAnularId(null)}
      />
    </div>
  )
}

/* ── Styled Components ───────────────────────────────────────── */

const overlay = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(11, 30, 19, 0.45)',
  backdropFilter: 'blur(6px)',
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  animation: 'overlayIn var(--dur-base) var(--ease-out) both',
}

const saleDrawer = {
  background: 'var(--canvas)',
  width: '100%',
  maxWidth: '1080px',
  height: '92vh',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 'var(--r-xl)',
  boxShadow: 'var(--shadow-xl)',
  overflow: 'hidden',
  animation: 'modalIn var(--dur-slow) var(--ease-spring) both',
}

const drawerHead = {
  padding: '1.25rem 2.5rem',
  background: 'var(--surface)',
  borderBottom: '1px solid var(--border-soft)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const drawerBody = {
  padding: '2rem 2.5rem',
  overflowY: 'auto',
  flex: 1,
}

const drawerFoot = {
  padding: '1.5rem 2.5rem',
  background: 'var(--surface)',
  borderTop: '1px solid var(--border-soft)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const resultsFloat = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
  marginTop: '6px',
  zIndex: 50,
  maxHeight: '220px',
  overflowY: 'auto',
  boxShadow: 'var(--shadow-lg)',
}

const resultItem = {
  padding: '12px 16px',
  borderBottom: '1px solid var(--border-soft)',
  cursor: 'pointer',
  transition: 'background var(--dur-fast) ease',
}

const emptyCart = {
  padding: '3rem 2rem',
  textAlign: 'center',
  background: 'var(--surface-2)',
  borderRadius: 'var(--r-lg)',
  border: '2px dashed var(--border)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const cartTotalRow = {
  padding: '1.25rem 1.5rem',
  background: 'var(--surface-sunken)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: '1px solid var(--border-soft)',
}

const invoiceDoc = {
  background: 'var(--surface)',
  width: '100%',
  maxWidth: '840px',
  maxHeight: '94vh',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 'var(--r-lg)',
  boxShadow: 'var(--shadow-xl)',
  overflow: 'hidden',
  animation: 'modalIn var(--dur-slow) var(--ease-spring) both',
}

const docContent = {
  padding: '3.5rem 3rem',
  overflowY: 'auto',
  flex: 1,
}

const docGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1.5rem',
  marginBottom: '2rem',
}

const docFooter = {
  marginTop: '3rem',
  paddingTop: '2rem',
  borderTop: '2.5px solid var(--forest)',
  alignItems: 'flex-start',
}

const docActions = {
  padding: '1.25rem 3rem',
  background: 'var(--surface-2)',
  borderTop: '1px solid var(--border-soft)',
}
