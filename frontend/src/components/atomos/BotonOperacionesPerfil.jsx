const LABELS = {
  'cambiar-nombre':      'Cambiar el nombre',
  'cambiar-contrasenia': 'Cambiar la contraseña',
  'cerrar-sesion':       'Cerrar Sesión',
}

/**
 * Botón de acción del panel de perfil.
 * @param {'cambiar-nombre'|'cambiar-contrasenia'|'cerrar-sesion'} variante
 */
function BotonOperacionesPerfil({ variante = 'cambiar-nombre', onClick, disabled = false }) {
  return (
    <button
      type="button"
      className="btn-operaciones-perfil"
      onClick={onClick}
      disabled={disabled}
    >
      {LABELS[variante]}
    </button>
  )
}

export default BotonOperacionesPerfil
