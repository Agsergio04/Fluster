function BotonSeleccionarFoto({ disabled = false, onClick }) {
  return (
    <button
      className="btn-seleccionar-foto"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      Selecciona la foto
    </button>
  )
}

export default BotonSeleccionarFoto
