import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './semaforo.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { obtenerAgrupados } from '../../services/semaforoService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'

const TRAMOS = ['sin-coste', 'primer-tramo', 'segundo-tramo', 'inactivo']

const ultimaFecha = c => {
  const fecha = c.fechaDevolucion ?? c.fechaSalidaPuerto ?? c.fechaEntradaPuerto ?? c.fechaInicioLibre
  return fecha ? new Date(fecha).toLocaleDateString('es-ES') : '-'
}

const mapearContenedor = (c, estado) => ({
  id:              c._id,
  estado,
  codigoBic:       c.codigoBIC,
  ultimaOperacion: ultimaFecha(c),
  cliente:         c._semaforo?.cliente ?? null,
  tarifaAcumulada: 0,
})

function Semaforo() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const [busquedas, setBusquedas] = useState({
    'sin-coste': '', 'primer-tramo': '', 'segundo-tramo': '', 'inactivo': '',
  })
  const [grupos, setGrupos] = useState({
    'sin-coste': [], 'primer-tramo': [], 'segundo-tramo': [], 'inactivo': [],
  })

  useEffect(() => {
    obtenerAgrupados()
      .then(data => setGrupos({
        'sin-coste':    (data.freeTime     ?? []).map(c => mapearContenedor(c, 'sin-coste')),
        'primer-tramo': (data.primerTramo  ?? []).map(c => mapearContenedor(c, 'primer-tramo')),
        'segundo-tramo':(data.segundoTramo ?? []).map(c => mapearContenedor(c, 'segundo-tramo')),
        'inactivo':     (data.inactivos    ?? []).map(c => mapearContenedor(c, 'inactivo')),
      }))
      .catch(() => {})
  }, [])

  const handleBusquedaCambio = (tramo, valor) =>
    setBusquedas(prev => ({ ...prev, [tramo]: valor }))

  const itemsFiltrados = tramo =>
    grupos[tramo].filter(item =>
      !busquedas[tramo].trim() ||
      item.codigoBic.toLowerCase().includes(busquedas[tramo].trim().toLowerCase())
    )

  return (
    <div className="semaforo">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="seguimiento"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <section className="semaforo__intro">
        <h1 className="semaforo__titulo">Estado de los contenedores</h1>
        <p className="semaforo__subtitulo">
          Visualizacion en tiempo real del estado de los contenedores y los costes
          asociados a la detencion y sobreestadía de dichos contenedores
        </p>
      </section>

      <div className="semaforo__contenido">
        {TRAMOS.map(tramo => (
          <ConjuntoCards
            key={tramo}
            variante="semaforo"
            tramo={tramo}
            itemsPorPagina={9}
            busqueda={busquedas[tramo]}
            onBusquedaCambio={e => handleBusquedaCambio(tramo, e.target.value)}
            onBuscar={() => {}}
            items={itemsFiltrados(tramo)}
          />
        ))}
      </div>
    </div>
  )
}

export default Semaforo
