import EstadoAnteriorIcon from '../../assets/icons/Icono Estado anterior.svg?react'
import EstadoPosteriorIcon from '../../assets/icons/Icono estado Posterior.svg?react'

function BotonCambiarEstado({
  mostrarAnterior  = true,
  mostrarSiguiente = true,
  onAnterior,
  onSiguiente,
}) {
  return (
    <div className="btn-cambiar-estado">
      {mostrarAnterior && (
        <button
          className="btn-cambiar-estado__flecha"
          type="button"
          aria-label="Estado anterior"
          onClick={onAnterior}
        >
          <EstadoAnteriorIcon aria-hidden="true" />
        </button>
      )}
      <span className="btn-cambiar-estado__label">Estado</span>
      {mostrarSiguiente && (
        <button
          className="btn-cambiar-estado__flecha"
          type="button"
          aria-label="Estado siguiente"
          onClick={onSiguiente}
        >
          <EstadoPosteriorIcon aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default BotonCambiarEstado
