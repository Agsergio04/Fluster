/** Botón CTA principal de la página de inicio que lleva al registro. */
function BotonEmpezarAhora({ disabled = false, onClick }) {
  return (
    <button
      className="btn-empezar-ahora"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      Empieza ahora
    </button>
  )
}

export default BotonEmpezarAhora
