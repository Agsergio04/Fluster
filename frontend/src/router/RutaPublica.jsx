import { Navigate } from 'react-router-dom'
import { isAuthenticated, getUsuario } from '../services/session'

const RUTA_POR_ROL = {
  admin:    '/panel-de-control',
  gestor:   '/semaforo',
  operador: '/meter-contenedor',
}

function RutaPublica({ children }) {
  if (!isAuthenticated()) return children
  const usuario = getUsuario()
  return <Navigate to={RUTA_POR_ROL[usuario?.rol] ?? '/'} replace />
}

export default RutaPublica
