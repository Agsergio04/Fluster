/** Botón que dispara el input file oculto para seleccionar una foto de contenedor. */
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
