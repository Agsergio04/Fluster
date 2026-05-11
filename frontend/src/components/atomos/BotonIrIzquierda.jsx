import EstadoAnteriorIcon from '../../assets/icons/Icono Estado anterior.svg?react'

function BotonIrIzquierda({ disabled = false, onClick }) {
  return (
    <button
      className="btn-ir-izquierda"
      type="button"
      aria-label="Ir a la izquierda"
      disabled={disabled}
      onClick={onClick}
    >
      <EstadoAnteriorIcon aria-hidden="true" />
    </button>
  )
}

export default BotonIrIzquierda
