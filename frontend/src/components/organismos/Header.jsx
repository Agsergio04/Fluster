import { useState } from 'react'
import CabeceraHeader from '../moleculas/CabeceraHeader'
import BotonesMenuHamburguesa from '../moleculas/BotonesMenuHamburguesa'

/**
 * Cabecera de la aplicación presente en todas las páginas.
 * El menú hamburguesa solo se renderiza cuando el usuario está autenticado (rol != null)
 * y únicamente cuando el estado interno lo marca como abierto.
 *
 * @param {string|null} rol          - Rol del usuario ('admin'|'gestor'|'operador'|null)
 * @param {string}      seccionActiva - Clave de la sección para resaltar el enlace activo
 * @param {'light'|'dark'} tema
 * @param {function}    onToggleTema
 * @param {function}    onNavegar     - Callback que recibe la ruta destino
 */
function Header({ rol = null, seccionActiva, tema = 'light', onToggleTema, onNavegar }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <header className={`header${menuAbierto ? ' header--abierto' : ''}`}>
      <CabeceraHeader
        loggeado={!!rol}
        tema={tema}
        onToggleTema={onToggleTema}
        // El botón hamburguesa solo existe si el usuario tiene sesión iniciada
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
    </header>
  )
}

export default Header
