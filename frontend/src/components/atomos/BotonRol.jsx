function BotonRol({ icon, titulo, descripcion, active = false, onClick }) {
  return (
    <button
      className={`btn-rol${active ? ' btn-rol--active' : ''}`}
      type="button"
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="btn-rol__icono">
        {icon}
      </span>
      <span className="btn-rol__texto">
        <span className="btn-rol__titulo">{titulo}</span>
        <span className="btn-rol__descripcion">{descripcion}</span>
      </span>
    </button>
  )
}

export default BotonRol
