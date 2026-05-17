import EstadoPosteriorIcon from '../../assets/icons/Icono estado Posterior.svg?react'

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
