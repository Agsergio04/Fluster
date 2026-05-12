import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './contenedores.scss'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'
import HistorialCiclosContenedor from '../../components/organismos/HistorialCiclosContenedor'
import PanelGenerarInforme from '../../components/organismos/PanelGenerarInforme'

function Contenedores() {
  const navigate   = useNavigate()
  const usuario    = getUsuario()
  const [tema, setTema] = useState('light')

  const [ciclos]   = useState([])

  const [fechaDesde,      setFechaDesde]      = useState('')
  const [fechaHasta,      setFechaHasta]      = useState('')
  const [fechaEspecifica, setFechaEspecifica] = useState('')
  const [naviera,         setNaviera]         = useState('')
  const [cliente,         setCliente]         = useState('')
  const [ordenAscendente,  setOrdenAscendente]  = useState(false)
  const [ordenDescendente, setOrdenDescendente] = useState(false)
  const [ordenAlfabetico,  setOrdenAlfabetico]  = useState(false)

  return (
    <div className="contenedores">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="seguimiento"
        tema={tema}
        onToggleTema={() => setTema(t => t === 'light' ? 'dark' : 'light')}
        onNavegar={ruta => navigate(ruta)}
      />

      <section className="contenedores__intro">
        <h1 className="contenedores__titulo">Registro del contenedor</h1>
        <p className="contenedores__subtitulo">
          Historial completo de los ciclos del contenedor con los costes de demurrage
          y detention asociados a cada periodo de actividad
        </p>
      </section>

      <div className="contenedores__cuerpo">
        <div className="contenedores__historial">
          <HistorialCiclosContenedor
            ciclos={ciclos}
            ciclosPorPagina={1}
            onCancelar={() => navigate(-1)}
          />
        </div>

        <div className="contenedores__informe">
          <PanelGenerarInforme
            variante="individual"
            fechaDesde={fechaDesde}           onFechaDesde={e => setFechaDesde(e.target.value)}
            fechaHasta={fechaHasta}           onFechaHasta={e => setFechaHasta(e.target.value)}
            fechaEspecifica={fechaEspecifica} onFechaEspecifica={e => setFechaEspecifica(e.target.value)}
            naviera={naviera}                 onNaviera={e => setNaviera(e.target.value)}
            cliente={cliente}                 onCliente={e => setCliente(e.target.value)}
            ordenAscendente={ordenAscendente}   onOrdenAscendente={() => setOrdenAscendente(v => !v)}
            ordenDescendente={ordenDescendente} onOrdenDescendente={() => setOrdenDescendente(v => !v)}
            ordenAlfabetico={ordenAlfabetico}   onOrdenAlfabetico={() => setOrdenAlfabetico(v => !v)}
            onGenerarInforme={() => {}}
          />
        </div>
      </div>
    </div>
  )
}

export default Contenedores
