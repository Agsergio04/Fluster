import TarifasIcon          from '../../assets/icons/Icono Tarifas.svg?react'
import ContenedoresFotoIcon from '../../assets/icons/Icono de contenedores por foto.svg?react'
import SemaforoIcon         from '../../assets/icons/semaforo.svg?react'

// Mapa de variantes a contenido estático para la sección de características de la home
const VARIANTES = {
  'tarifas': {
    icon:        <TarifasIcon />,
    titulo:      'Gestor de tarifas',
    descripcion: 'Gestiona los costes de las tarifas por días para la automatización de los costes',
  },
  'ocr': {
    icon:        <ContenedoresFotoIcon />,
    titulo:      'Contenedores mediante OCR',
    descripcion: 'Incluye contenedores de manera dinámica mediante fotos realizadas ya sea por el móvil o que tengas con anterioridad',
  },
  'semaforo': {
    icon:        <SemaforoIcon />,
    titulo:      'Semáforo de gastos',
    descripcion: 'Gestión de los contenedores asociados a cada transacción del contenedor con su respectivo coste total',
  },
}

/**
 * Bloque de característica de la página de inicio.
 * @param {'tarifas'|'ocr'|'semaforo'} variante
 */
function InformacionHome({ variante = 'tarifas' }) {
  const { icon, titulo, descripcion } = VARIANTES[variante]
  return (
    <div className="informacion-home">
      <div className="informacion-home__encabezado">
        <span className="informacion-home__icono" aria-hidden="true">{icon}</span>
        <p className="informacion-home__titulo">{titulo}</p>
      </div>
      <p className="informacion-home__descripcion">{descripcion}</p>
    </div>
  )
}

export default InformacionHome
