import LogoFluster from '../../assets/images/Fluster logo con letras.png'
import BotonMenuHamburguesa from '../atomos/BotonMenuHamburguesa'
import BotonCambiarTema from '../atomos/BotonCambiarTema'

function CabeceraHeader({ loggeado = false, tema = 'light', onToggleTema, onMenuHamburguesa, onLogoClick }) {
  return (
    <header className="cabecera-header">
      <button
        type="button"
        className="cabecera-header__logo-btn"
        onClick={onLogoClick}
        aria-label="Ir a inicio"
      >
        <img
          src={LogoFluster}
          alt="Fluster"
          className="cabecera-header__logo"
        />
      </button>
      <div className="cabecera-header__controles">
        {loggeado && (
          <BotonMenuHamburguesa onClick={onMenuHamburguesa} />
        )}
        <BotonCambiarTema tema={tema} onClick={onToggleTema} />
      </div>
    </header>
  )
}

export default CabeceraHeader
