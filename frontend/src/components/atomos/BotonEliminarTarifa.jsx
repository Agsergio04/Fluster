import BorrarIcon from '../../assets/icons/Icono borrar.svg?react'

function BotonEliminarTarifa({ disabled = false, onClick }) {
  return (
    <button
      className="btn-eliminar-tarifa"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      Eliminar
      <BorrarIcon aria-hidden="true" />
    </button>
  )
}

export default BotonEliminarTarifa
