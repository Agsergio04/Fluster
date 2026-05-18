import { Navigate } from 'react-router-dom'
import { isAuthenticated, getUsuario } from '../services/session'

// Tabla de destino por rol para que usuarios ya autenticados no puedan
// volver a login o registro; los redirige directamente a su área de trabajo
const RUTA_POR_ROL = {
  admin:    '/panel-de-control',
  gestor:   '/semaforo',
  operador: '/meter-contenedor',
}

/**
 * Guarda de ruta para páginas de acceso no autenticado (login, registro).
 * Si ya hay sesión activa, redirige al área correspondiente al rol del usuario.
 */
function RutaPublica({ children }) {
  if (!isAuthenticated()) return children
  const usuario = getUsuario()
  return <Navigate to={RUTA_POR_ROL[usuario?.rol] ?? '/'} replace />
}

export default RutaPublica
