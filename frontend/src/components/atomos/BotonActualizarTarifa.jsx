import EditarIcon from '../../assets/icons/Icono editar.svg?react'

function BotonActualizarTarifa({ disabled = false, onClick }) {
  return (
    <button
      className="btn-actualizar-tarifa"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      Actualizar
      <EditarIcon aria-hidden="true" />
    </button>
  )
}

export default BotonActualizarTarifa
