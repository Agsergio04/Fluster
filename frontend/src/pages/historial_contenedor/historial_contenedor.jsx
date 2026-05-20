import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './historial_contenedor.scss'
import useTema from '../../hooks/useTema'
import useHistorial from '../../hooks/useHistorial'
import { getUsuario } from '../../services/session'
import { editarDemurrageCiclo, editarDetentionCiclo } from '../../services/cicloService'
import { obtenerDatosInforme, registrarInforme } from '../../services/informeService'
import { generarPDFIndividual } from '../../services/pdfService'
import Header from '../../components/organismos/Header'
import HistorialCiclosContenedor from '../../components/organismos/HistorialCiclosContenedor'
import PanelGenerarInforme from '../../components/organismos/PanelGenerarInforme'
import ModalEditarTramo from '../../components/moleculas/ModalEditarTramo'
import Notificacion from '../../components/atomos/Notificacion'

/**
 * Página de historial detallado de un contenedor concreto.
 * Muestra todos los ciclos del contenedor con el desglose de costes
 * de demurrage (tiempo en puerto) y detention (tiempo con el cliente),
 * y permite editar manualmente las fechas de cada tramo para corregir
 * errores de registro. El coste se recalcula automáticamente en el servidor
 * al guardar los cambios.
 *
 * En el panel lateral también se puede generar un informe PDF individual
 * con los ciclos del contenedor aplicando filtros de fecha, naviera y cliente.
 */
function HistorialContenedor() {
  const navigate        = useNavigate()
  const { id }          = useParams()   // ID MongoDB del contenedor extraído de la URL
  const usuario         = getUsuario()
  const [tema, toggleTema] = useTema()

  const { contenedor, ciclos, cargando, aviso, setAviso, recargar } = useHistorial(id)

  // Estado del modal de edición de tramo (null = cerrado)
  const [modal,          setModal]          = useState(null)

  // Filtros del panel de informe individual
  const [fechaDesde,     setFechaDesde]     = useState('')
  const [fechaHasta,     setFechaHasta]     = useState('')
  const [fechaEspecifica, setFechaEspecifica] = useState('')
  const [naviera,        setNaviera]        = useState('')
  const [cliente,        setCliente]        = useState('')
  const [orden,          setOrden]          = useState('')
  const [ordenAlfabetico, setOrdenAlfabetico] = useState(false)

  /**
   * Abre el modal de edición con los datos del tramo seleccionado.
   * El campo tramo indica si se edita 'Demurrage' o 'Detention' para
   * que el modal muestre la etiqueta correcta y el manejador sepa
   * qué endpoint invocar al guardar.
   *
   * @param {string} cicloId - ID del ciclo a editar
   * @param {string} tramo   - 'Demurrage' | 'Detention'
   * @param {{ fechaInicio: string, fechaFin: string }} fechas - Fechas actuales del tramo
   */
  const abrirModal = (cicloId, tramo, fechas) =>
    setModal({ cicloId, tramo, ...fechas })

  const cerrarModal = () => setModal(null)

  /**
   * Guarda los cambios de fechas del tramo en el servidor.
   * Tras guardar recarga el historial completo para que los costes
   * recalculados queden reflejados en pantalla sin desmontar la página.
   *
   * @param {{ fechaInicio: string, fechaFin: string }} fechas - Nuevas fechas del tramo
   */
  const handleGuardar = async (fechas) => {
    try {
      if (modal.tramo === 'Demurrage') {
        await editarDemurrageCiclo(modal.cicloId, fechas)
      } else {
        await editarDetentionCiclo(modal.cicloId, fechas)
      }
      cerrarModal()
      recargar()
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo guardar el tramo')
    }
  }

  /**
   * Obtiene los datos de ciclos filtrados y genera el PDF individual del contenedor.
   * El nombre del archivo PDF usa el código BIC del contenedor como identificador.
   * Al igual que en el almacén, registra cada ciclo incluido con .catch silencioso
   * para no bloquear la descarga si algún ciclo ya estaba registrado.
   */
  const handleGenerarInforme = async () => {
    try {
      const datosCiclos = await obtenerDatosInforme({
        contenedorId: id,
        fechaDesde, fechaHasta, fechaEspecifica,
        naviera, cliente,
        ordenAscendente:  String(orden === 'ascendente'),
        ordenDescendente: String(orden === 'descendente'),
        ordenAlfabetico:  String(ordenAlfabetico),
      })
      const ok = await generarPDFIndividual(datosCiclos, contenedor?.codigoBIC ?? id)
      if (ok) {
        await Promise.all(
          datosCiclos.map(c => registrarInforme(c.contenedorId._id, c._id).catch(() => {}))
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
        seccionActiva="seguimiento"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main>
        <section className="historial-contenedor__intro">
          <h1 className="historial-contenedor__titulo">Registro del contenedor</h1>
          <p className="historial-contenedor__codigo">{contenedor?.codigoBIC ?? id}</p>
          <p className="historial-contenedor__subtitulo">
            Historial completo de los ciclos del contenedor con los costes de demurrage
            y detention asociados a cada periodo de actividad
          </p>
        </section>

        {cargando ? (
          <p className="historial-contenedor__cargando">Cargando historial...</p>
        ) : (
          <div className="historial-contenedor__cuerpo">
            <section className="historial-contenedor__historial">
              <HistorialCiclosContenedor
                ciclos={ciclos}
                ciclosPorPagina={2}
                onCancelar={() => navigate(-1)}
                onEditarDemurrage={(ciclo) => abrirModal(ciclo.cicloId, 'Demurrage', { fechaInicio: ciclo.demurrage?.fechaInicio, fechaFin: ciclo.demurrage?.fechaFin })}
                onEditarDetention={(ciclo) => abrirModal(ciclo.cicloId, 'Detention', { fechaInicio: ciclo.detention?.fechaInicio, fechaFin: ciclo.detention?.fechaFin })}
              />
            </section>

            <aside className="historial-contenedor__informe">
              <PanelGenerarInforme
                variante="individual"
                fechaDesde={fechaDesde}           onFechaDesde={e => setFechaDesde(e.target.value)}
                fechaHasta={fechaHasta}           onFechaHasta={e => setFechaHasta(e.target.value)}
                fechaEspecifica={fechaEspecifica} onFechaEspecifica={e => setFechaEspecifica(e.target.value)}
                naviera={naviera}                 onNaviera={e => setNaviera(e.target.value)}
                cliente={cliente}                 onCliente={e => setCliente(e.target.value)}
                orden={orden}                       onOrden={setOrden}
                ordenAlfabetico={ordenAlfabetico}   onOrdenAlfabetico={() => setOrdenAlfabetico(v => !v)}
                onGenerarInforme={handleGenerarInforme}
              />
            </aside>
          </div>
        )}
      </main>

      {modal && (
        <ModalEditarTramo
          tramo={modal.tramo}
          fechaInicio={modal.fechaInicio}
          fechaFin={modal.fechaFin}
          onGuardar={handleGuardar}
          onCancelar={cerrarModal}
        />
      )}

      <Notificacion mensaje={aviso} onCerrar={() => setAviso('')} />
    </>
  )
}

export default HistorialContenedor
