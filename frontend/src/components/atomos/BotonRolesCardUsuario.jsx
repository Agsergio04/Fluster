const LABELS = {
  admin:    'Admin',
  gestor:   'Gestor',
  operador: 'Operador',
}

/**
 * Botón de cambio de rol en la tarjeta de usuario del panel de control.
 * El modificador BEM se construye dinámicamente:
 * - '--seleccionado': este es el rol actual del usuario
 * - '--off': el usuario tiene otro rol; este botón está disponible para cambiarlo
 * - sin modificador: estado neutro (ninguno de los anteriores)
 *
 * @param {'admin'|'gestor'|'operador'} rol
 * @param {boolean} seleccionado - true si este rol es el asignado actualmente
 * @param {boolean} active        - false aplica el estado '--off' (rol no asignado, disponible)
 * @param {boolean} disabled
 */
function BotonRolesCardUsuario({ rol = 'operador', active = true, seleccionado = false, disabled = false, onClick }) {
  const modificador = seleccionado ? '--seleccionado' : !active ? '--off' : ''
  return (
    <button
      className={`btn-roles-card-usuario${modificador ? ` btn-roles-card-usuario${modificador}` : ''}`}
      type="button"
      aria-pressed={seleccionado}
      disabled={disabled}
      onClick={onClick}
    >
      {LABELS[rol] ?? LABELS.operador}
    </button>
  )
}

export default BotonRolesCardUsuario
