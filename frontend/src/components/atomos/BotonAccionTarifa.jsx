import BorrarIcon from '../../assets/icons/Icono borrar.svg?react'
import EditarIcon from '../../assets/icons/Icono editar.svg?react'

// Mapeo de acción a texto e icono para no duplicar lógica condicional en el JSX
const CONFIG = {
  eliminar:   { label: 'Eliminar',   Icon: BorrarIcon },
  actualizar: { label: 'Actualizar', Icon: EditarIcon  },
}

/**
 * Botón de acción contextual para la tabla de tarifas.
 * Usado tanto en el panel de perfil (para cambiar foto) como en la tabla de navieras.
 *
 * @param {'eliminar'|'actualizar'} accion
 */
function BotonAccionTarifa({ accion = 'eliminar', disabled = false, onClick }) {
  const { label, Icon } = CONFIG[accion] ?? CONFIG.eliminar
  return (
    <button
      className="btn-accion-tarifa"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
      <Icon aria-hidden="true" />
    </button>
  )
}

export default BotonAccionTarifa
