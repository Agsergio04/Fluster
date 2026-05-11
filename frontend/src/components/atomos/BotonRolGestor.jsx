import GestorIcon from '../../assets/icons/Icono Gestor.svg?react'

function BotonRolGestor({ titulo, descripcion, active = false, onClick }) {
  return (
    <button
      className={`btn-rol${active ? ' btn-rol--active' : ''}`}
      type="button"
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="btn-rol__icono">
        <GestorIcon aria-hidden="true" />
      </span>
      <span className="btn-rol__texto">
        <span className="btn-rol__titulo">{titulo}</span>
        <span className="btn-rol__descripcion">{descripcion}</span>
      </span>
    </button>
  )
}

export default BotonRolGestor
