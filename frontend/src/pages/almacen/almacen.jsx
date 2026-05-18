import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './almacen.scss'
import useTema from '../../hooks/useTema'
import useContenedores from '../../hooks/useContenedores'
import { getUsuario } from '../../services/session'
import { eliminarContenedor } from '../../services/contenedorService'
import { obtenerDatosInforme, registrarInforme } from '../../services/informeService'
import { generarPDFGeneral } from '../../services/pdfService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'
import PanelGenerarInforme from '../../components/organismos/PanelGenerarInforme'
import Notificacion from '../../components/atomos/Notificacion'

/**
 * Página de consulta del almacén para el gestor.
 * Muestra el listado paginado de todos los contenedores registrados
 * y permite navegar al historial individual o eliminar los que están en INACTIVO.
 *
 * También incluye el panel de generación de informes generales PDF con filtros
 * por fechas, naviera, cliente, código BIC y criterio de ordenación.
 * Las transiciones de estado NO se realizan aquí sino en el Semáforo.
 */
function Almacen() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const { contenedores, setContenedores, cargando, aviso, setAviso } = useContenedores()
  const [busqueda,       setBusqueda]       = useState('')

  // Filtros del panel de generación de informe general
  const [fechaDesde,       setFechaDesde]       = useState('')
  const [fechaHasta,       setFechaHasta]       = useState('')
  const [fechaEspecifica,  setFechaEspecifica]  = useState('')
  const [naviera,          setNaviera]          = useState('')
  const [cliente,          setCliente]          = useState('')
  const [codigoBic,        setCodigoBic]        = useState('')
  const [orden,            setOrden]            = useState('')
  const [ordenAlfabetico,  setOrdenAlfabetico]  = useState(false)

  /**
   * Devuelve la fecha de la última operación conocida del contenedor.
   * El recorrido va de la más reciente (devolución) a la más antigua
   * (inicio del período libre) para mostrar siempre el último evento.
   *
   * @param {object} c - Contenedor del servidor
   * @returns {string} Fecha formateada o '-' si no hay ninguna
   */
  const ultimaFecha = c => {
    const fecha = c.fechaDevolucion ?? c.fechaSalidaPuerto ?? c.fechaEntradaPuerto ?? c.fechaInicioLibre
    return fecha ? new Date(fecha).toLocaleDateString('es-ES') : '-'
  }

  // Normalización de los contenedores al formato que espera ConjuntoCards,
  // aplicando el filtro de búsqueda por código BIC en el cliente
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

  /**
   * Elimina un contenedor del sistema y actualiza la lista local
   * sin necesidad de recargar todos los datos desde el servidor.
   * El backend rechaza la eliminación si el contenedor no está en INACTIVO.
   *
   * @param {{ id: string }} item - Ítem de la tarjeta con el ID del contenedor
   */
  const handleBorrar = async (item) => {
    try {
      await eliminarContenedor(item.id)
      setContenedores(prev => prev.filter(c => c._id !== item.id))
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo eliminar el contenedor')
    }
  }

  /**
   * Genera un informe PDF con todos los ciclos que cumplen los filtros aplicados.
   * Tras generar el PDF, registra cada ciclo incluido en el historial de informes
   * para tener traza de qué se ha exportado y cuándo.
   * Los registros fallidos se ignoran con .catch(() => {}) para no bloquear
   * la descarga si algún ciclo ya estaba registrado previamente.
   */
  const handleGenerarInforme = async () => {
    try {
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
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo generar el informe')
    }
  }

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="almacen"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main>
        <section className="almacen__intro">
          <h1 className="almacen__titulo">Contenedores Registrados</h1>
          <p className="almacen__subtitulo">
            Aqui se encuentra el listado de los contenedores registrados para la gestion
            y la creacion de informes asociadas a la detencion y sobreestadia entre
            tramos de los contenedores
          </p>
        </section>

        <div className="almacen__contenido">
          {cargando ? (
            <p className="almacen__cargando">Cargando contenedores...</p>
          ) : (
            <ConjuntoCards
              variante="almacen"
              itemsPorPagina={9}
              busqueda={busqueda}
              onBusquedaCambio={e => setBusqueda(e.target.value)}
              onBuscar={() => {}}
              items={items}
              onVerRegistro={item => navigate(`/almacen/historial/${item.id}`)}
              onBorrar={handleBorrar}
            />
          )}
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
            onGenerarInforme={handleGenerarInforme}
          />
        </div>
      </main>

      <Notificacion mensaje={aviso} onCerrar={() => setAviso('')} />
    </>
  )
}

export default Almacen
