import { Navigate } from 'react-router-dom'
import { isAuthenticated, getUsuario } from '../services/session'

/**
 * Guarda de ruta que comprueba autenticación y rol antes de renderizar.
 * - Sin sesión activa → redirige a la home (/)
 * - Con sesión pero rol no permitido → redirige a /error
 * Si roles es undefined, solo exige estar autenticado.
 *
 * @param {string[]} roles    - Roles que pueden acceder a esta ruta
 * @param {ReactNode} children
 */
function RutaProtegida({ roles, children }) {
  if (!isAuthenticated()) return <Navigate to="/" replace />

  const usuario = getUsuario()
  if (roles && !roles.includes(usuario?.rol)) return <Navigate to="/error" replace />

  return children
}

export default RutaProtegida
