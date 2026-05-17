import TarifasIcon          from '../../assets/icons/Icono Tarifas.svg?react'
import ContenedoresFotoIcon from '../../assets/icons/Icono de contenedores por foto.svg?react'
import SemaforoIcon         from '../../assets/icons/semaforo.svg?react'

const VARIANTES = {
  'tarifas': {
    icon:        <TarifasIcon />,
    titulo:      'Gestor de tarifas',
    descripcion: 'Gestiona los costes de las tarifas por dias para la automatizacion de los costes',
  },
  'ocr': {
    icon:        <ContenedoresFotoIcon />,
    titulo:      'Contenedores mediante OCR',
    descripcion: 'Incluye contenedores de manera dinamica mediante fotos realizadas ya sea por el movil o que tengas con anterioridad',
  },
  'semaforo': {
    icon:        <SemaforoIcon />,
    titulo:      'Semaforo de gastos',
    descripcion: 'Gestion de los contenedores asociados a cada transacion del contenedor con su respectivo coste total',
  },
}

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
