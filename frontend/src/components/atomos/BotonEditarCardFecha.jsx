import EditarIcon from '../../assets/icons/Icono editar.svg?react'

function BotonEditarCardFecha({ disabled = false, onClick }) {
  return (
    <button
      className="btn-editar-card-fecha"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      Editar
      <EditarIcon aria-hidden="true" />
    </button>
  )
}

export default BotonEditarCardFecha
