/**
 * Botón CTA de la página de inicio para un usuario ya autenticado.
 * El texto y el destino dependen del rol; los decide el componente que lo usa.
 */
function BotonAccionRol({ label, onClick, disabled = false }) {
  return (
    <button
      className="btn-accion-rol"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default BotonAccionRol
