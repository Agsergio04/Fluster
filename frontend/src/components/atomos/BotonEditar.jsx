import EditarIcon from '../../assets/icons/Icono editar.svg?react'

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
