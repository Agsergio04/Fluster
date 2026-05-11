import BorrarIcon from '../../assets/icons/Icono borrar.svg?react'

function BotonBorrarUsuario({ disabled = false, onClick }) {
  return (
    <button
      className="btn-borrar-usuario"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <BorrarIcon className="btn-borrar-usuario__icono" aria-hidden="true" />
      Eliminar usuario
    </button>
  )
}

export default BotonBorrarUsuario
