import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './almacen.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { listarContenedores, eliminarContenedor } from '../../services/contenedorService'
import { obtenerDatosInforme, registrarInforme } from '../../services/informeService'
import { generarPDFGeneral } from '../../services/pdfService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'
import PanelGenerarInforme from '../../components/organismos/PanelGenerarInforme'
import Notificacion from '../../components/atomos/Notificacion'

function Almacen() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const [busqueda,     setBusqueda]     = useState('')
  const [contenedores, setContenedores] = useState([])
  const [aviso,        setAviso]        = useState('')

  const [fechaDesde,       setFechaDesde]       = useState('')
  const [fechaHasta,       setFechaHasta]       = useState('')
  const [fechaEspecifica,  setFechaEspecifica]  = useState('')
  const [naviera,          setNaviera]          = useState('')
  const [cliente,          setCliente]          = useState('')
  const [codigoBic,        setCodigoBic]        = useState('')
  const [orden,            setOrden]            = useState('')
  const [ordenAlfabetico,  setOrdenAlfabetico]  = useState(false)

  useEffect(() => {
    listarContenedores()
      .then(data => setContenedores(data))
      .catch(() => {})
  }, [])

  const ultimaFecha = c => {
    const fecha = c.fechaDevolucion ?? c.fechaSalidaPuerto ?? c.fechaEntradaPuerto ?? c.fechaInicioLibre
    return fecha ? new Date(fecha).toLocaleDateString('es-ES') : '-'
  }

  const items = contenedores
    .filter(c =>
      !busqueda.trim() ||
      c.codigoBIC.toLowerCase().includes(busqueda.trim().toLowerCase())
    )
    .map(c => ({
      id:              c._id,
      codigoBic:       c.codigoBIC,
      estado:          c.estado,
      ultimaOperacion: ultimaFecha(c),
      fechaInclusion:  new Date(c.creadoEn).toLocaleDateString('es-ES'),
      operador:        c.creadoPor?.nombre ?? '-',
    }))

  return (
    <div className="almacen">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="almacen"
        tema={tema}
        onToggleTema={toggleTema}
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
          itemsPorPagina={9}
          busqueda={busqueda}
          onBusquedaCambio={e => setBusqueda(e.target.value)}
          onBuscar={() => {}}
          items={items}
          onVerRegistro={item => navigate(`/almacen/historial/${item.id}`)}
          onBorrar={async item => {
            try {
              await eliminarContenedor(item.id)
              setContenedores(prev => prev.filter(c => c._id !== item.id))
            } catch (err) {
              setAviso(err.response?.data?.mensaje ?? 'No se pudo eliminar el contenedor')
            }
          }}
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
          orden={orden}                       onOrden={setOrden}
          ordenAlfabetico={ordenAlfabetico}   onOrdenAlfabetico={() => setOrdenAlfabetico(v => !v)}
          onGenerarInforme={async () => {
            const ciclos = await obtenerDatosInforme({
              fechaDesde, fechaHasta, fechaEspecifica,
              naviera, cliente, codigoBic,
              ordenAscendente:  String(orden === 'ascendente'),
              ordenDescendente: String(orden === 'descendente'),
              ordenAlfabetico:  String(ordenAlfabetico),
            })
            const ok = generarPDFGeneral(ciclos)
            if (ok) {
              await Promise.all(
                ciclos.map(c => registrarInforme(c.contenedorId._id, c._id).catch(() => {}))
              )
            }
          }}
        />
      </div>
      <Notificacion mensaje={aviso} onCerrar={() => setAviso('')} />
    </div>
  )
}

export default Almacen
