const LABELS = {
  admin:    'Admin',
  gestor:   'Gestor',
  operador: 'Operador',
}

function BotonRolesCardUsuario({ rol = 'operador', active = true, disabled = false, onClick }) {
  return (
    <button
      className={`btn-roles-card-usuario${!active ? ' btn-roles-card-usuario--off' : ''}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {LABELS[rol] ?? LABELS.operador}
    </button>
  )
}

export default BotonRolesCardUsuario
