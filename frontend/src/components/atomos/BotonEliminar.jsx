import BorrarIcon from '../../assets/icons/Icono borrar.svg?react'

/** Botón de eliminar (solo icono de papelera) para las tarjetas de contenedor del operador. */
function BotonEliminar({ disabled = false, onClick }) {
  return (
    <button
      className="btn-eliminar"
      type="button"
      aria-label="Eliminar"
      disabled={disabled}
      onClick={onClick}
    >
      <BorrarIcon aria-hidden="true" />
    </button>
  )
}

export default BotonEliminar
