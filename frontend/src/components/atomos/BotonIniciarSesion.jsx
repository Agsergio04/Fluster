function BotonIniciarSesion({ disabled = false, onClick }) {
  return (
    <button
      className="btn-iniciar-sesion"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      Iniciar Sesión
    </button>
  )
}

export default BotonIniciarSesion
