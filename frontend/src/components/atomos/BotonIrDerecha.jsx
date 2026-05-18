import EstadoPosteriorIcon from '../../assets/icons/Icono estado Posterior.svg?react'

/** Flecha derecha del paginador para ir a la página siguiente. */
function BotonIrDerecha({ disabled = false, onClick }) {
  return (
    <button
      className="btn-ir-derecha"
      type="button"
      aria-label="Ir a la derecha"
      disabled={disabled}
      onClick={onClick}
    >
      <EstadoPosteriorIcon aria-hidden="true" />
    </button>
  )
}

export default BotonIrDerecha
