import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Cerdos from './pages/Cerdos.jsx'
import CerdoDetalle from './pages/CerdoDetalle.jsx'
import Cochineras from './pages/Cochineras.jsx'
import Empleados from './pages/Empleados.jsx'
import Inventario from './pages/Inventario.jsx'
import Registros from './pages/Registros.jsx'
import Ventas from './pages/Ventas.jsx'
import Veterinario from './pages/Veterinario.jsx'
import Clientes from './pages/Clientes.jsx'

function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>
  
  if (!user) return <Navigate to="/login" replace />

  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cerdos" element={<Cerdos />} />
            <Route path="cerdos/:id" element={<CerdoDetalle />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="registros" element={<Registros />} />
            <Route path="pesajes" element={<Navigate to="/registros" replace />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="veterinario" element={<Veterinario />} />

            <Route path="cochineras" element={<PrivateRoute requiredRole="administrador"><Cochineras /></PrivateRoute>} />
            <Route path="empleados" element={<PrivateRoute requiredRole="administrador"><Empleados /></PrivateRoute>} />
            <Route path="clientes" element={<PrivateRoute requiredRole="administrador"><Clientes /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
