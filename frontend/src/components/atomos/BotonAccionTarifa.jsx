import BorrarIcon from '../../assets/icons/Icono borrar.svg?react'
import EditarIcon from '../../assets/icons/Icono editar.svg?react'

const CONFIG = {
  eliminar:   { label: 'Eliminar',   Icon: BorrarIcon },
  actualizar: { label: 'Actualizar', Icon: EditarIcon  },
}

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
