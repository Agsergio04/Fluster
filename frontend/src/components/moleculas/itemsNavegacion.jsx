import GestorIcon          from '../../assets/icons/Icono Gestor.svg?react'
import TarifasIcon         from '../../assets/icons/Icono Tarifas.svg?react'
import ContenedoresIcon    from '../../assets/icons/Icono contenedores.svg?react'
import PerfilIcon          from '../../assets/icons/Icono Perfil.svg?react'
import ContenedoresFotoIcon from '../../assets/icons/Icono de contenedores por foto.svg?react'
import PanelControlIcon    from '../../assets/icons/Icono panel de control.svg?react'

// Elementos de navegación por rol. El id coincide con la clave seccionActiva
// que recibe el Header para marcar el botón activo de la página actual.
// Vive en su propio módulo (no junto al componente) para no romper el Fast
// Refresh, que exige que un archivo solo exporte componentes.
export const ITEMS = {
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
