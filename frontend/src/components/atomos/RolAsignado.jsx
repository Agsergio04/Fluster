const LABELS = {
  admin:    'Admin',
  gestor:   'Gestor',
  operador: 'Operador',
}

function RolAsignado({ rol = 'operador' }) {
  return (
    <span className="rol-asignado">
      {LABELS[rol] ?? LABELS.operador}
    </span>
  )
}

export default RolAsignado
