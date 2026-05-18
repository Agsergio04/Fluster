import SolIcon from '../../assets/icons/Icono modo claro.svg?react'
import LunaIcon from '../../assets/icons/Icono modo oscuro.svg?react'

/**
 * Botón de alternancia de tema claro/oscuro.
 * Muestra el icono del modo al que se cambiará al pulsar (no el modo actual):
 * en modo claro muestra la luna (cambiar a oscuro) y viceversa.
 */
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
