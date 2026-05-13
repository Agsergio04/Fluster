import { useState } from 'react'
import CabeceraHeader from '../moleculas/CabeceraHeader'
import BotonesMenuHamburguesa from '../moleculas/BotonesMenuHamburguesa'

function Header({ rol = null, seccionActiva, tema = 'light', onToggleTema, onNavegar }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className={`header${menuAbierto ? ' header--abierto' : ''}`}>
      <CabeceraHeader
        loggeado={!!rol}
        tema={tema}
        onToggleTema={onToggleTema}
        onMenuHamburguesa={rol ? () => setMenuAbierto(v => !v) : undefined}
        onLogoClick={() => onNavegar?.('/')}
      />
      {rol && menuAbierto && (
        <BotonesMenuHamburguesa
          rol={rol}
          seccionActiva={seccionActiva}
          onNavegar={onNavegar}
        />
      )}
    </div>
  )
}

export default Header
