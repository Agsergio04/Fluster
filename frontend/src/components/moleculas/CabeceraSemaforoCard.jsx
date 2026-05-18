import EstadoContenedorSemaforo from '../atomos/EstadoContenedorSemaforo'
import BotonCambiarEstado from '../atomos/BotonCambiarEstado'

/**
 * Cabecera de la CardSemaforo: badge de estado y botones de navegación
 * para moverse entre contenedores del mismo grupo naviera/cliente.
 */
function CabeceraSemaforoCard({
  estado           = 'inactivo',
  mostrarAnterior  = false,
  mostrarSiguiente = true,
  onAnterior,
  onSiguiente,
}) {
  return (
    <div className="cabecera-semaforo-card">
      <EstadoContenedorSemaforo estado={estado} />
      <BotonCambiarEstado
        mostrarAnterior={mostrarAnterior}
        mostrarSiguiente={mostrarSiguiente}
        onAnterior={onAnterior}
        onSiguiente={onSiguiente}
      />
    </div>
  )
}

export default CabeceraSemaforoCard
