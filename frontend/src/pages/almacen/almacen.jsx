import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './almacen.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import useContenedores from '../../hooks/useContenedores'
import { getUsuario } from '../../services/session'
import { eliminarContenedor } from '../../services/contenedorService'
import { obtenerDatosInforme, registrarInforme } from '../../services/informeService'
import { generarPDFGeneral } from '../../services/pdfService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'
import PanelGenerarInforme from '../../components/organismos/PanelGenerarInforme'
import ModalConfirmacion from '../../components/moleculas/ModalConfirmacion'
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
  useDocumentTitle('Almacén | Fluster')

  const { contenedores, setContenedores, cargando, aviso, setAviso } = useContenedores()
  const [busqueda,       setBusqueda]       = useState('')
  // Contenedor pendiente de confirmación de borrado; null cuando no hay diálogo
  const [aBorrar,        setABorrar]        = useState(null)
  const [borrando,       setBorrando]       = useState(false)

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
   * Confirma el borrado del contenedor pendiente (el que abrió el diálogo):
   * lo elimina y actualiza la lista local sin recargar todos los datos.
   * El backend rechaza la eliminación si el contenedor no está en INACTIVO.
   */
  const handleConfirmarBorrado = async () => {
    try {
      setBorrando(true)
      await eliminarContenedor(aBorrar.id)
      setContenedores(prev => prev.filter(c => c._id !== aBorrar.id))
      setABorrar(null)
    } catch (err) {
      setABorrar(null)
      setAviso(err.response?.data?.mensaje ?? 'No se pudo eliminar el contenedor')
    } finally {
      setBorrando(false)
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
      const ok = await generarPDFGeneral(ciclos)
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
          <h1 className="almacen__titulo">Contenedores registrados</h1>
          <p className="almacen__subtitulo">
            Aquí se encuentra el listado de los contenedores registrados para la gestión
            y la creación de informes asociados a la detención y sobreestadía entre
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
              onBorrar={item => setABorrar(item)}
            />
          )}
        </div>

        {!cargando && (
          <>
            <section className="almacen__informe-intro">
              <h2 className="almacen__seccion-titulo">Generar informe general</h2>
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
          </>
        )}
      </main>

      {aBorrar && (
        <ModalConfirmacion
          titulo="Borrar contenedor"
          mensaje={`¿Seguro que quieres borrar el contenedor ${aBorrar.codigoBic}? Esta acción no se puede deshacer.`}
          textoConfirmar="Borrar"
          cargando={borrando}
          onConfirmar={handleConfirmarBorrado}
          onCancelar={() => setABorrar(null)}
        />
      )}

      <Notificacion mensaje={aviso} onCerrar={() => setAviso('')} />
    </>
  )
}

export default Almacen
