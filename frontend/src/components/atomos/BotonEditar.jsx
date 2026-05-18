import EditarIcon from '../../assets/icons/Icono editar.svg?react'

/** Botón de editar con texto e icono para las tarjetas de contenedor del operador. */
function BotonEditar({ disabled = false, onClick }) {
  return (
    <button
      className="btn-editar"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      Editar
      <EditarIcon aria-hidden="true" />
    </button>
  )
}

export default BotonEditar
