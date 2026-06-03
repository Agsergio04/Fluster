import HamburguesaIcon from '../../assets/icons/Icono del menu de hamburguesa.svg?react'

/**
 * Botón de tres líneas que abre y cierra el menú de navegación.
 * Expone su estado a los lectores de pantalla con aria-expanded y enlaza el
 * panel que controla con aria-controls.
 */
function BotonMenuHamburguesa({ disabled = false, onClick, expanded = false, controls }) {
  return (
    <button
      className="btn-menu-hamburguesa"
      type="button"
      aria-label={expanded ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={expanded}
      aria-controls={controls}
      disabled={disabled}
      onClick={onClick}
    >
      <HamburguesaIcon aria-hidden="true" />
    </button>
  )
}

export default BotonMenuHamburguesa
