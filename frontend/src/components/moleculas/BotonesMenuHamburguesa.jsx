import BotonDesplegableHamburguesa from '../atomos/BotonDesplegableHamburguesa'
import { ITEMS } from './itemsNavegacion'

/**
 * Menú de navegación desplegado por el botón hamburguesa.
 * Solo muestra las rutas accesibles para el rol activo.
 *
 * @param {'gestor'|'operador'|'admin'} rol
 * @param {string} seccionActiva - Id del ítem que debe aparecer como activo
 * @param {function} onNavegar
 */
function BotonesMenuHamburguesa({ id, rol = 'gestor', seccionActiva, onNavegar }) {
  const items = ITEMS[rol] ?? []
  return (
    <nav id={id} className="botones-menu-hamburguesa" aria-label="Navegación principal">
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
  )
}

export default BotonesMenuHamburguesa
