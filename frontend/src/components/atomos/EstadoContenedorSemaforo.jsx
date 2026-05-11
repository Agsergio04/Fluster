import InactivoIcon from '../../assets/icons/Icono de Inactivo.svg?react'
import PuertoIcon   from '../../assets/icons/Icono de puerto.svg?react'
import ClienteIcon  from '../../assets/icons/Icono de Cliente.svg?react'

const ESTADOS = {
  'inactivo':        { label: 'Inactivo', Icono: InactivoIcon, mod: 'inactivo'  },
  'puerto-free':     { label: 'Puerto',   Icono: PuertoIcon,   mod: 'free'      },
  'cliente-free':    { label: 'Cliente',  Icono: ClienteIcon,  mod: 'free'      },
  'puerto-primer':   { label: 'Puerto',   Icono: PuertoIcon,   mod: 'primer'    },
  'cliente-primer':  { label: 'Cliente',  Icono: ClienteIcon,  mod: 'primer'    },
  'puerto-segundo':  { label: 'Puerto',   Icono: PuertoIcon,   mod: 'segundo'   },
  'cliente-segundo': { label: 'Cliente',  Icono: ClienteIcon,  mod: 'segundo'   },
}

function EstadoContenedorSemaforo({ estado = 'inactivo' }) {
  const { label, Icono, mod } = ESTADOS[estado] ?? ESTADOS['inactivo']

  return (
    <div className={`estado-contenedor-semaforo estado-contenedor-semaforo--${mod}`}>
      <span className="estado-contenedor-semaforo__label">{label}</span>
      <Icono className="estado-contenedor-semaforo__icono" aria-hidden="true" />
    </div>
  )
}

export default EstadoContenedorSemaforo
