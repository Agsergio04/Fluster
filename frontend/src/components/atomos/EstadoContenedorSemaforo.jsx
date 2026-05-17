import InactivoIcon from '../../assets/icons/Icono de Inactivo.svg?react'
import PuertoIcon   from '../../assets/icons/Icono de puerto.svg?react'
import ClienteIcon  from '../../assets/icons/Icono de Cliente.svg?react'

const ESTADOS = {
  'inactivo':        { label: 'Inactivo',                Icono: InactivoIcon, mod: 'inactivo' },
  'puerto-free':     { label: 'Puerto — Sin costes',     Icono: PuertoIcon,   mod: 'free'     },
  'cliente-free':    { label: 'Cliente — Sin costes',    Icono: ClienteIcon,  mod: 'free'     },
  'puerto-primer':   { label: 'Puerto — Primer tramo',   Icono: PuertoIcon,   mod: 'primer'   },
  'cliente-primer':  { label: 'Cliente — Primer tramo',  Icono: ClienteIcon,  mod: 'primer'   },
  'puerto-segundo':  { label: 'Puerto — Segundo tramo',  Icono: PuertoIcon,   mod: 'segundo'  },
  'cliente-segundo': { label: 'Cliente — Segundo tramo', Icono: ClienteIcon,  mod: 'segundo'  },
}

const LABELS_CORTOS = {
  'inactivo':        'Inactivo',
  'puerto-free':     'Puerto',
  'cliente-free':    'Cliente',
  'puerto-primer':   'Puerto',
  'cliente-primer':  'Cliente',
  'puerto-segundo':  'Puerto',
  'cliente-segundo': 'Cliente',
}

function EstadoContenedorSemaforo({ estado = 'inactivo' }) {
  const { label, Icono, mod } = ESTADOS[estado] ?? ESTADOS['inactivo']

  return (
    <div
      className={`estado-contenedor-semaforo estado-contenedor-semaforo--${mod}`}
      aria-label={label}
    >
      <span className="estado-contenedor-semaforo__label" aria-hidden="true">
        {LABELS_CORTOS[estado] ?? label}
      </span>
      <Icono className="estado-contenedor-semaforo__icono" aria-hidden="true" />
    </div>
  )
}

export default EstadoContenedorSemaforo
