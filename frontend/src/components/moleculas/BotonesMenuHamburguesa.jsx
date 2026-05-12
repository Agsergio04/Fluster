import BotonDesplegableHamburguesa from '../atomos/BotonDesplegableHamburguesa'
import GestorIcon          from '../../assets/icons/Icono Gestor.svg?react'
import TarifasIcon         from '../../assets/icons/Icono Tarifas.svg?react'
import ContenedoresIcon    from '../../assets/icons/Icono contenedores.svg?react'
import PerfilIcon          from '../../assets/icons/Icono Perfil.svg?react'
import ContenedoresFotoIcon from '../../assets/icons/Icono de contenedores por foto.svg?react'
import PanelControlIcon    from '../../assets/icons/Icono panel de control.svg?react'

const ITEMS = {
  gestor: [
    { id: 'seguimiento',      label: 'Seguimiento',      icon: <GestorIcon /> },
    { id: 'tarifas',          label: 'Tarifas',           icon: <TarifasIcon /> },
    { id: 'almacen',          label: 'Almacen',           icon: <ContenedoresIcon /> },
    { id: 'perfil',           label: 'Perfil',            icon: <PerfilIcon /> },
  ],
  operador: [
    { id: 'meter-contenedor', label: 'Meter contenedor', icon: <ContenedoresFotoIcon /> },
    { id: 'contenedores',     label: 'Contenedores',     icon: <ContenedoresIcon /> },
    { id: 'perfil',           label: 'Perfil',           icon: <PerfilIcon /> },
  ],
  admin: [
    { id: 'panel-control',   label: 'Panel de control', icon: <PanelControlIcon /> },
    { id: 'perfil',          label: 'Perfil',           icon: <PerfilIcon /> },
  ],
}

function BotonesMenuHamburguesa({ rol = 'gestor', seccionActiva, onNavegar }) {
  const items = ITEMS[rol] ?? []
  return (
    <nav className="botones-menu-hamburguesa">
      {items.map(({ id, label, icon }) => (
        <BotonDesplegableHamburguesa
          key={id}
          icon={icon}
          label={label}
          active={id === seccionActiva}
          onClick={() => onNavegar?.(id)}
        />
      ))}
    </nav>
  )
}

export default BotonesMenuHamburguesa
