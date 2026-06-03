import LogoFluster from '../../assets/images/Fluster logo con letras.png'
import BotonMenuHamburguesa from '../atomos/BotonMenuHamburguesa'
import BotonCambiarTema from '../atomos/BotonCambiarTema'

/**
 * Barra superior fija del header: logo, botón hamburguesa y selector de tema.
 * El botón hamburguesa solo se monta si el usuario tiene sesión (loggeado=true).
 */
function CabeceraHeader({ loggeado = false, menuAbierto = false, tema = 'light', onToggleTema, onMenuHamburguesa, onLogoClick }) {
  return (
    <div className="cabecera-header">
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
          width="343"
          height="343"
          decoding="async"
        />
      </button>
      <div className="cabecera-header__controles">
        {loggeado && (
          <BotonMenuHamburguesa
            onClick={onMenuHamburguesa}
            expanded={menuAbierto}
            controls="menu-navegacion"
          />
        )}
        <BotonCambiarTema tema={tema} onClick={onToggleTema} />
      </div>
    </div>
  )
}

export default CabeceraHeader
