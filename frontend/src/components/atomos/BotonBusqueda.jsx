import BuscarIcon from '../../assets/icons/icono buscar.svg?react'

/** Botón de lupa para el campo de búsqueda; el texto visible lo aporta aria-label. */
function BotonBusqueda({ disabled = false, onClick }) {
  return (
    <button
      className="btn-busqueda"
      type="button"
      aria-label="Buscar"
      disabled={disabled}
      onClick={onClick}
    >
      <BuscarIcon aria-hidden="true" />
    </button>
  )
}

export default BotonBusqueda
