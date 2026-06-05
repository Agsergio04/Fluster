import BotonMenuHamburguesa from '../atomos/BotonMenuHamburguesa'
import BotonCambiarTema from '../atomos/BotonCambiarTema'
import BotonDesplegableHamburguesa from '../atomos/BotonDesplegableHamburguesa'
import { ITEMS } from './BotonesMenuHamburguesa'

function CabeceraHeader({ loggeado = false, menuAbierto = false, tema = 'light', onToggleTema, onMenuHamburguesa, onLogoClick, rol, seccionActiva, onNavegar }) {
  const items = rol ? (ITEMS[rol] ?? []) : []

  return (
    <div className="cabecera-header">
      <button
        type="button"
        className="cabecera-header__logo-btn"
        onClick={onLogoClick}
        aria-label="Ir a inicio"
      >
        <img
          src="/logo-fluster.svg"
          alt="Fluster"
          className="cabecera-header__logo"
          width="343"
          height="343"
          decoding="async"
        />
      </button>

      {loggeado && items.length > 0 && (
        <nav className="cabecera-header__nav-desktop" aria-label="Navegación principal">
          {items.map(({ id, label, icon, ruta }) => (
            <BotonDesplegableHamburguesa
              key={id}
              icon={icon}
              label={label}
              active={id === seccionActiva}
              onClick={() => onNavegar?.(ruta)}
            />
          ))}
        </nav>
      )}

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
