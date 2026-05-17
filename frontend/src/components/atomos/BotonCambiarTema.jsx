import SolIcon from '../../assets/icons/Icono modo claro.svg?react'
import LunaIcon from '../../assets/icons/Icono modo oscuro.svg?react'

function BotonCambiarTema({ tema = 'light', onClick }) {
  return (
    <button
      className="btn-cambiar-tema"
      type="button"
      aria-label={tema === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      onClick={onClick}
    >
      {tema === 'light'
        ? <LunaIcon aria-hidden="true" />
        : <SolIcon aria-hidden="true" />
      }
    </button>
  )
}

export default BotonCambiarTema
