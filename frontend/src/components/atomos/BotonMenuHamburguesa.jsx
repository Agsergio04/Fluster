import HamburguesaIcon from '../../assets/icons/Icono del menu de hamburguesa.svg?react'

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
