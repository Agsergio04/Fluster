/**
 * Botón de navegación del menú hamburguesa con icono y etiqueta.
 * Cuando está activo (página actual) muestra un separador visual a la izquierda
 * y usa aria-current="page" para lectores de pantalla.
 */
function BotonDesplegableHamburguesa({ icon, label, active = false, disabled = false, onClick }) {
  return (
    <button
      className={`btn-desplegable-hamburguesa${active ? ' btn-desplegable-hamburguesa--active' : ''}`}
      type="button"
      aria-current={active ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {active && <span className="btn-desplegable-hamburguesa__separador" aria-hidden="true" />}
      <span className="btn-desplegable-hamburguesa__icono" aria-hidden="true">{icon}</span>
      <span className="btn-desplegable-hamburguesa__label">{label}</span>
    </button>
  )
}

export default BotonDesplegableHamburguesa
