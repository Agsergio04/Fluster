import BotonDesplegableHamburguesa from '../atomos/BotonDesplegableHamburguesa'
import GestorIcon          from '../../assets/icons/Icono Gestor.svg?react'
import TarifasIcon         from '../../assets/icons/Icono Tarifas.svg?react'
import ContenedoresIcon    from '../../assets/icons/Icono contenedores.svg?react'
import PerfilIcon          from '../../assets/icons/Icono Perfil.svg?react'
import ContenedoresFotoIcon from '../../assets/icons/Icono de contenedores por foto.svg?react'
import PanelControlIcon    from '../../assets/icons/Icono panel de control.svg?react'

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

function BotonesMenuHamburguesa({ rol = 'gestor', seccionActiva, onNavegar }) {
  const items = ITEMS[rol] ?? []
  return (
    <nav className="botones-menu-hamburguesa" aria-label="Navegación principal">
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
