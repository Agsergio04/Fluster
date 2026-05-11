import EstadoContenedorSemaforo from '../atomos/EstadoContenedorSemaforo'
import BotonCambiarEstado from '../atomos/BotonCambiarEstado'

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
