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
      <button
        className="btn-cambiar-estado__flecha"
        type="button"
        aria-label="Estado anterior"
        aria-hidden={mostrarAnterior ? undefined : 'true'}
        tabIndex={mostrarAnterior ? undefined : -1}
        onClick={onAnterior}
        style={{ visibility: mostrarAnterior ? 'visible' : 'hidden' }}
      >
        <EstadoAnteriorIcon aria-hidden="true" />
      </button>
      <span className="btn-cambiar-estado__label">Estado</span>
      <button
        className="btn-cambiar-estado__flecha"
        type="button"
        aria-label="Estado siguiente"
        aria-hidden={mostrarSiguiente ? undefined : 'true'}
        tabIndex={mostrarSiguiente ? undefined : -1}
        onClick={onSiguiente}
        style={{ visibility: mostrarSiguiente ? 'visible' : 'hidden' }}
      >
        <EstadoPosteriorIcon aria-hidden="true" />
      </button>
    </div>
  )
}

export default BotonCambiarEstado
