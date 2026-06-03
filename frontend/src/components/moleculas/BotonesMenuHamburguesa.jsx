import BotonDesplegableHamburguesa from '../atomos/BotonDesplegableHamburguesa'
import GestorIcon          from '../../assets/icons/Icono Gestor.svg?react'
import TarifasIcon         from '../../assets/icons/Icono Tarifas.svg?react'
import ContenedoresIcon    from '../../assets/icons/Icono contenedores.svg?react'
import PerfilIcon          from '../../assets/icons/Icono Perfil.svg?react'
import ContenedoresFotoIcon from '../../assets/icons/Icono de contenedores por foto.svg?react'
import PanelControlIcon    from '../../assets/icons/Icono panel de control.svg?react'

// Elementos de navegación por rol. El id coincide con la clave seccionActiva
// que recibe el Header para marcar el botón activo de la página actual.
const ITEMS = {
  gestor: [
    { id: 'seguimiento', label: 'Seguimiento',      icon: <GestorIcon />,           ruta: '/semaforo' },
    { id: 'tarifas',     label: 'Tarifas',           icon: <TarifasIcon />,          ruta: '/tarifas' },
    { id: 'almacen',     label: 'Almacen',           icon: <ContenedoresIcon />,     ruta: '/almacen' },
    { id: 'perfil',      label: 'Perfil',            icon: <PerfilIcon />,           ruta: '/perfil' },
  ],
  operador: [
    { id: 'meter-contenedor', label: 'Meter contenedor', icon: <ContenedoresFotoIcon />, ruta: '/meter-contenedor' },
    { id: 'contenedores',     label: 'Contenedores',     icon: <ContenedoresIcon />,     ruta: '/contenedores' },
    { id: 'perfil',           label: 'Perfil',           icon: <PerfilIcon />,           ruta: '/perfil' },
  ],
  admin: [
    { id: 'panel-de-control', label: 'Panel de control', icon: <PanelControlIcon />, ruta: '/panel-de-control' },
    { id: 'perfil',           label: 'Perfil',           icon: <PerfilIcon />,       ruta: '/perfil' },
  ],
}

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
