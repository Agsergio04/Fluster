import LogoFluster from '../../assets/images/Fluster logo con letras.png'
import BotonMenuHamburguesa from '../atomos/BotonMenuHamburguesa'
import BotonCambiarTema from '../atomos/BotonCambiarTema'

function CabeceraHeader({ loggeado = false, tema = 'light', onToggleTema, onMenuHamburguesa }) {
  return (
    <header className="cabecera-header">
      <img
        src={LogoFluster}
        alt="Fluster"
        className="cabecera-header__logo"
      />
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
