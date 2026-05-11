import SolIcon from '../../assets/icons/Icono modo claro.svg?react'
import LunaIcon from '../../assets/icons/Icono modo oscuro.svg?react'

function BotonCambiarTema({ theme = 'light', onClick }) {
  return (
    <button
      className="btn-cambiar-tema"
      type="button"
      aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      onClick={onClick}
    >
      {theme === 'light'
        ? <SolIcon aria-hidden="true" />
        : <LunaIcon aria-hidden="true" />
      }
    </button>
  )
}

export default BotonCambiarTema
