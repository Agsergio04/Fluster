/**
 * Botón de selección de rol grande con icono, título y descripción.
 * Tiene dos estados adicionales al estándar activo/inactivo:
 * - active: este rol está seleccionado (relleno de color)
 * - off: el otro rol está seleccionado (atenuado pero clickable para cambiar)
 * El modificador off permite dar feedback visual de que hay una selección activa
 * sin deshabilitar el botón.
 */
function BotonRol({ icon, titulo, descripcion, active = false, off = false, onClick }) {
  return (
    <button
      className={`btn-rol${active ? ' btn-rol--active' : ''}${off ? ' btn-rol--off' : ''}`}
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
