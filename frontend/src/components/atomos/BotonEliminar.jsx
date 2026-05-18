import BorrarIcon from '../../assets/icons/Icono borrar.svg?react'

/** Botón de eliminar con texto e icono para las tarjetas de contenedor del operador. */
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
