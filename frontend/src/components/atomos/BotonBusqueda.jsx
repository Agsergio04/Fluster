import BuscarIcon from '../../assets/icons/icono buscar.svg?react'

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
