const LABELS = {
  admin:    'Admin',
  gestor:   'Gestor',
  operador: 'Operador',
}

function BotonRolesCardUsuario({ rol = 'operador', active = true, seleccionado = false, disabled = false, onClick }) {
  const modificador = seleccionado ? '--seleccionado' : !active ? '--off' : ''
  return (
    <button
      className={`btn-roles-card-usuario${modificador ? ` btn-roles-card-usuario${modificador}` : ''}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {LABELS[rol] ?? LABELS.operador}
    </button>
  )
}

export default BotonRolesCardUsuario
