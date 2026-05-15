import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './historial_contenedor.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { obtenerContenedor } from '../../services/contenedorService'
import { editarDemurrageCiclo, editarDetentionCiclo } from '../../services/cicloService'
import { obtenerDatosInforme, registrarInforme } from '../../services/informeService'
import { generarPDFIndividual } from '../../services/pdfService'
import Header from '../../components/organismos/Header'
import HistorialCiclosContenedor from '../../components/organismos/HistorialCiclosContenedor'
import PanelGenerarInforme from '../../components/organismos/PanelGenerarInforme'
import ModalEditarTramo from '../../components/moleculas/ModalEditarTramo'

function HistorialContenedor() {
  const navigate        = useNavigate()
  const { id }          = useParams()
  const usuario         = getUsuario()
  const [tema, toggleTema] = useTema()

  const [contenedor, setContenedor] = useState(null)
  const [ciclos,     setCiclos]     = useState([])
  const [modal,      setModal]      = useState(null)

  const cargarContenedor = () =>
    obtenerContenedor(id)
      .then(data => {
        setContenedor(data)
        setCiclos(
          (data.ciclos ?? []).map(c => ({
            cicloId:   c._id,
            cliente:   c.clienteId?.nombre ?? '-',
            demurrage: c.demurrage,
            detention: c.detention,
          }))
        )
      })
      .catch(() => {})

  useEffect(() => { cargarContenedor() }, [id])

  const abrirModal = (cicloId, tramo, fechas) =>
    setModal({ cicloId, tramo, ...fechas })

  const cerrarModal = () => setModal(null)

  const handleGuardar = async (fechas) => {
    if (modal.tramo === 'Demurrage') {
      await editarDemurrageCiclo(modal.cicloId, fechas)
    } else {
      await editarDetentionCiclo(modal.cicloId, fechas)
    }
    cerrarModal()
    cargarContenedor()
  }

  const [fechaDesde,      setFechaDesde]      = useState('')
  const [fechaHasta,      setFechaHasta]      = useState('')
  const [fechaEspecifica, setFechaEspecifica] = useState('')
  const [naviera,         setNaviera]         = useState('')
  const [cliente,         setCliente]         = useState('')
  const [ordenAscendente,  setOrdenAscendente]  = useState(false)
  const [ordenDescendente, setOrdenDescendente] = useState(false)
  const [ordenAlfabetico,  setOrdenAlfabetico]  = useState(false)

  return (
    <div className="historial-contenedor">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="seguimiento"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <section className="historial-contenedor__intro">
        <h1 className="historial-contenedor__titulo">Registro del contenedor</h1>
        <p className="historial-contenedor__codigo">{contenedor?.codigoBIC ?? id}</p>
        <p className="historial-contenedor__subtitulo">
          Historial completo de los ciclos del contenedor con los costes de demurrage
          y detention asociados a cada periodo de actividad
        </p>
      </section>

      <div className="historial-contenedor__cuerpo">
        <div className="historial-contenedor__historial">
          <HistorialCiclosContenedor
            ciclos={ciclos}
            ciclosPorPagina={2}
            onCancelar={() => navigate(-1)}
            onEditarDemurrage={(ciclo) => abrirModal(ciclo.cicloId, 'Demurrage', { fechaInicio: ciclo.demurrage?.fechaInicio, fechaFin: ciclo.demurrage?.fechaFin })}
            onEditarDetention={(ciclo) => abrirModal(ciclo.cicloId, 'Detention', { fechaInicio: ciclo.detention?.fechaInicio, fechaFin: ciclo.detention?.fechaFin })}
          />
        </div>

        <div className="historial-contenedor__informe">
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
            onGenerarInforme={async () => {
              const datosCiclos = await obtenerDatosInforme({
                contenedorId: id,
                fechaDesde, fechaHasta, fechaEspecifica,
                naviera, cliente,
                ordenAscendente:  String(ordenAscendente),
                ordenDescendente: String(ordenDescendente),
                ordenAlfabetico:  String(ordenAlfabetico),
              })
              const ok = generarPDFIndividual(datosCiclos, contenedor?.codigoBIC ?? id)
              if (ok) {
                await Promise.all(
                  datosCiclos.map(c => registrarInforme(c.contenedorId._id, c._id).catch(() => {}))
                )
              }
            }}
          />
        </div>
      </div>
      {modal && (
        <ModalEditarTramo
          tramo={modal.tramo}
          fechaInicio={modal.fechaInicio}
          fechaFin={modal.fechaFin}
          onGuardar={handleGuardar}
          onCancelar={cerrarModal}
        />
      )}
    </div>
  )
}

export default HistorialContenedor
