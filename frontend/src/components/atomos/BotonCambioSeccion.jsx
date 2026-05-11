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
