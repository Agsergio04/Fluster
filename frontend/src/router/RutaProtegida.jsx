import { Navigate } from 'react-router-dom'
import { isAuthenticated, getUsuario } from '../services/session'

function RutaProtegida({ roles, children }) {
  if (!isAuthenticated()) return <Navigate to="/" replace />

  const usuario = getUsuario()
  if (roles && !roles.includes(usuario?.rol)) return <Navigate to="/error" replace />

  return children
}

export default RutaProtegida
