import EditarIcon from '../../assets/icons/Icono editar.svg?react'

/** Botón de lápiz para abrir el modal de edición de fecha en las tarjetas del semáforo e historial. */
function BotonEditadoFechaContenedor({ disabled = false, onClick }) {
  return (
    <button
      className="btn-editado-fecha-contenedor"
      type="button"
      aria-label="Editar fecha del contenedor"
      disabled={disabled}
      onClick={onClick}
    >
      <EditarIcon aria-hidden="true" />
    </button>
  )
}

export default BotonEditadoFechaContenedor
