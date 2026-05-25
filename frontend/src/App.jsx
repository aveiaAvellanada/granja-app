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
import Pesajes from './pages/Pesajes.jsx'
import Ventas from './pages/Ventas.jsx'
import Veterinario from './pages/Veterinario.jsx'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>
  return user ? children : <Navigate to="/login" replace />
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
            <Route path="cochineras" element={<Cochineras />} />
            <Route path="empleados" element={<Empleados />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="pesajes" element={<Pesajes />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="veterinario" element={<Veterinario />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
