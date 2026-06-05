import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../services/session'
import useDestinoRol from '../hooks/useDestinoRol'
import Spinner from '../components/atomos/Spinner'

const pantallaCargando = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
    <Spinner tamanio="lg" />
  </div>
)

/**
 * Guarda de rutas solo para invitados (login y registro). Si ya hay sesión
 * activa, redirige al destino del rol —el mismo que abre el botón de la landing—
 * en vez de mostrar el formulario. Para el operador espera al chequeo de
 * contenedores para elegir entre /meter-contenedor y /contenedores.
 *
 * @param {ReactNode} children
 */
function RutaInvitado({ children }) {
  const autenticado = isAuthenticated()
  const { destino, cargando } = useDestinoRol()

  if (!autenticado) return children
  if (cargando)     return pantallaCargando
  if (destino)      return <Navigate to={destino} replace />
  return children
}

export default RutaInvitado
