/** Botón que dispara el input file oculto para seleccionar o cambiar la foto de contenedor. */
function BotonSeleccionarFoto({ disabled = false, onClick, label = 'Selecciona la foto' }) {
  return (
    <button
      className="btn-seleccionar-foto"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default BotonSeleccionarFoto
