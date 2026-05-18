/** Botón de número de página del paginador; resaltado cuando corresponde a la página actual. */
function BotonCambioSeccion({ children, active = false, disabled = false, onClick }) {
  return (
    <button
      className={`btn-cambio-seccion${active ? ' btn-cambio-seccion--active' : ''}`}
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default BotonCambioSeccion
