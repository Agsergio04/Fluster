import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './almacen.scss'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'
import PanelGenerarInforme from '../../components/organismos/PanelGenerarInforme'

function Almacen() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, setTema] = useState('light')

  const [busqueda, setBusqueda] = useState('')
  const [items]                 = useState([])

  const [fechaDesde,      setFechaDesde]      = useState('')
  const [fechaHasta,      setFechaHasta]      = useState('')
  const [fechaEspecifica, setFechaEspecifica] = useState('')
  const [naviera,         setNaviera]         = useState('')
  const [cliente,         setCliente]         = useState('')
  const [codigoBic,       setCodigoBic]       = useState('')
  const [ordenAscendente,  setOrdenAscendente]  = useState(false)
  const [ordenDescendente, setOrdenDescendente] = useState(false)
  const [ordenAlfabetico,  setOrdenAlfabetico]  = useState(false)

  return (
    <div className="almacen">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="almacen"
        tema={tema}
        onToggleTema={() => setTema(t => t === 'light' ? 'dark' : 'light')}
        onNavegar={ruta => navigate(ruta)}
      />

      <section className="almacen__intro">
        <h1 className="almacen__titulo">Contenedores Registrados</h1>
        <p className="almacen__subtitulo">
          Aqui se encuentra el listado de los contenedores registrados para la gestion
          y la creacion de informes asociadas a la detencion y sobreestadia entre
          tramos de los contenedores
        </p>
      </section>

      <div className="almacen__contenido">
        <ConjuntoCards
          variante="almacen"
          busqueda={busqueda}
          onBusquedaCambio={e => setBusqueda(e.target.value)}
          onBuscar={() => {}}
          items={items}
          onVerRegistro={item => navigate(`/almacen/historial/${item.codigoBic}`)}
          onBorrar={() => {}}
        />
      </div>

      <section className="almacen__informe-intro">
        <h2 className="almacen__titulo">Generar informe general</h2>
        <p className="almacen__subtitulo">
          Mediantes estos parametros puedes generar un informe de cada contenedor
          filtrando por estas caracteristicas
        </p>
      </section>

      <div className="almacen__informe">
        <PanelGenerarInforme
          variante="general"
          fechaDesde={fechaDesde}           onFechaDesde={e => setFechaDesde(e.target.value)}
          fechaHasta={fechaHasta}           onFechaHasta={e => setFechaHasta(e.target.value)}
          fechaEspecifica={fechaEspecifica} onFechaEspecifica={e => setFechaEspecifica(e.target.value)}
          naviera={naviera}                 onNaviera={e => setNaviera(e.target.value)}
          cliente={cliente}                 onCliente={e => setCliente(e.target.value)}
          codigoBic={codigoBic}             onCodigoBic={e => setCodigoBic(e.target.value)}
          ordenAscendente={ordenAscendente}   onOrdenAscendente={() => setOrdenAscendente(v => !v)}
          ordenDescendente={ordenDescendente} onOrdenDescendente={() => setOrdenDescendente(v => !v)}
          ordenAlfabetico={ordenAlfabetico}   onOrdenAlfabetico={() => setOrdenAlfabetico(v => !v)}
          onGenerarInforme={() => {}}
        />
      </div>
    </div>
  )
}

export default Almacen
