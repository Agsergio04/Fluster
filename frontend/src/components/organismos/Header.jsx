import { useState } from 'react'
import CabeceraHeader from '../moleculas/CabeceraHeader'
import BotonesMenuHamburguesa from '../moleculas/BotonesMenuHamburguesa'

function Header({ rol = null, seccionActiva, tema = 'light', onToggleTema, onNavegar }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <header className={`header${menuAbierto ? ' header--abierto' : ''}`}>
      <CabeceraHeader
        loggeado={!!rol}
        menuAbierto={menuAbierto}
        tema={tema}
        onToggleTema={onToggleTema}
        onMenuHamburguesa={rol ? () => setMenuAbierto(v => !v) : undefined}
        onLogoClick={() => { setMenuAbierto(false); onNavegar?.('/') }}
        rol={rol}
        seccionActiva={seccionActiva}
        onNavegar={(ruta) => { setMenuAbierto(false); onNavegar?.(ruta) }}
      />
      {rol && menuAbierto && (
        <BotonesMenuHamburguesa
          id="menu-navegacion"
          rol={rol}
          seccionActiva={seccionActiva}
          onNavegar={(ruta) => { setMenuAbierto(false); onNavegar?.(ruta) }}
        />
      )}
    </header>
  )
}

export default Header
