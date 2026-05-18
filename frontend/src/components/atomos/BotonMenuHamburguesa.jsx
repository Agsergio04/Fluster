import HamburguesaIcon from '../../assets/icons/Icono del menu de hamburguesa.svg?react'

/** Botón de tres líneas que abre y cierra el menú de navegación. */
function BotonMenuHamburguesa({ disabled = false, onClick }) {
  return (
    <button
      className="btn-menu-hamburguesa"
      type="button"
      aria-label="Abrir menú"
      disabled={disabled}
      onClick={onClick}
    >
      <HamburguesaIcon aria-hidden="true" />
    </button>
  )
}

export default BotonMenuHamburguesa
