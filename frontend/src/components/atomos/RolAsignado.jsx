const LABELS = {
  admin:    'Admin',
  gestor:   'Gestor',
  operador: 'Operador',
}

/** Badge de rol para mostrar el rol asignado al usuario en la tarjeta de usuario. */
function RolAsignado({ rol = 'operador' }) {
  return (
    <span className="rol-asignado">
      {LABELS[rol] ?? LABELS.operador}
    </span>
  )
}

export default RolAsignado
