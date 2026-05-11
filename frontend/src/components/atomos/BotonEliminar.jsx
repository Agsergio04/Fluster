import BorrarIcon from '../../assets/icons/Icono borrar.svg?react'

function BotonEliminar({ disabled = false, onClick }) {
  return (
    <button
      className="btn-eliminar"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      Eliminar
      <BorrarIcon aria-hidden="true" />
    </button>
  )
}

export default BotonEliminar
