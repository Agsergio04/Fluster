import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './semaforo.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { obtenerAgrupados } from '../../services/semaforoService'
import { crearCliente } from '../../services/clienteService'
import { entradaPuerto, salidaPuerto, cancelarCiclo, revertirSalidaPuerto, devolucion, actualizarContenedor } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'
import ModalEntradaPuerto from '../../components/organismos/ModalEntradaPuerto'
import ModalEditarFecha from '../../components/organismos/ModalEditarFecha'

const TRAMOS = ['sin-coste', 'primer-tramo', 'segundo-tramo', 'inactivo']

const TRAMO_SUFIJO = {
  'sin-coste':     'free',
  'primer-tramo':  'primer',
  'segundo-tramo': 'segundo',
}

const ultimaFecha = c => {
  const fecha = c.fechaDevolucion ?? c.fechaSalidaPuerto ?? c.fechaEntradaPuerto ?? c.fechaInicioLibre
  return fecha ? new Date(fecha).toLocaleDateString('es-ES') : '-'
}

const mapearContenedor = (c, tramo) => {
  const estadoBackend = c.estado
  const estado = estadoBackend === 'INACTIVO'
    ? 'inactivo'
    : `${estadoBackend.toLowerCase()}-${TRAMO_SUFIJO[tramo] ?? 'free'}`
  return {
    id:               c._id,
    estado,
    estadoBackend,
    codigoBic:        c.codigoBIC,
    ultimaOperacion:  ultimaFecha(c),
    fechaInicioLibre: c.fechaInicioLibre ?? null,
    cliente:          c._semaforo?.cliente ?? null,
    tarifaAcumulada:  c._semaforo?.costeAcumulado ?? 0,
  }
}

function Semaforo() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const [busquedas,   setBusquedas]   = useState({
    'sin-coste': '', 'primer-tramo': '', 'segundo-tramo': '', 'inactivo': '',
  })
  const [grupos,      setGrupos]      = useState({
    'sin-coste': [], 'primer-tramo': [], 'segundo-tramo': [], 'inactivo': [],
  })
  const [modalPuerto,  setModalPuerto]  = useState(null) // null | { id }
  const [modalFecha,   setModalFecha]   = useState(null) // null | { id, fechaInicioLibre }

  const cargarGrupos = useCallback(() => {
    obtenerAgrupados()
      .then(data => setGrupos({
        'sin-coste':     (data.freeTime     ?? []).map(c => mapearContenedor(c, 'sin-coste')),
        'primer-tramo':  (data.primerTramo  ?? []).map(c => mapearContenedor(c, 'primer-tramo')),
        'segundo-tramo': (data.segundoTramo ?? []).map(c => mapearContenedor(c, 'segundo-tramo')),
        'inactivo':      (data.inactivos    ?? []).map(c => mapearContenedor(c, 'inactivo')),
      }))
      .catch(() => {})
  }, [])

  useEffect(() => { cargarGrupos() }, [cargarGrupos])

  const handleEntradaPuerto = async (nombre) => {
    try {
      const cliente = await crearCliente(nombre)
      await entradaPuerto(modalPuerto.id, cliente._id)
      setModalPuerto(null)
      cargarGrupos()
    } catch (err) {
      console.error('Error en entrada a puerto:', err)
    }
  }

  const handleCancelarCiclo = async (id) => {
    try {
      await cancelarCiclo(id)
      cargarGrupos()
    } catch (err) {
      console.error('Error al cancelar ciclo:', err)
    }
  }

  const handleSalidaPuerto = async (id) => {
    try {
      await salidaPuerto(id)
      cargarGrupos()
    } catch (err) {
      console.error('Error en salida a puerto:', err)
    }
  }

  const handleEditarFecha = async (nuevaFecha) => {
    try {
      await actualizarContenedor(modalFecha.id, {
        fechaInicioLibre: new Date(nuevaFecha).toISOString(),
      })
      setModalFecha(null)
      cargarGrupos()
    } catch (err) {
      console.error('Error al editar fecha:', err)
    }
  }

  const handleRevertirSalida = async (id) => {
    try {
      await revertirSalidaPuerto(id)
      cargarGrupos()
    } catch (err) {
      console.error('Error al revertir salida:', err)
    }
  }

  const handleDevolucion = async (id) => {
    try {
      await devolucion(id)
      cargarGrupos()
    } catch (err) {
      console.error('Error en devolucion:', err)
    }
  }

  const handleBusquedaCambio = (tramo, valor) =>
    setBusquedas(prev => ({ ...prev, [tramo]: valor }))

  const itemsFiltrados = tramo =>
    grupos[tramo]
      .filter(item =>
        !busquedas[tramo].trim() ||
        item.codigoBic.toLowerCase().includes(busquedas[tramo].trim().toLowerCase())
      )
      .map(item => {
        const editarFecha = () => setModalFecha({ id: item.id, fechaInicioLibre: item.fechaInicioLibre })
        if (tramo === 'inactivo') {
          return { ...item, mostrarAnterior: false, mostrarSiguiente: true, onSiguiente: () => setModalPuerto({ id: item.id }), onEditarFecha: editarFecha }
        }
        if (item.estadoBackend === 'PUERTO') {
          return {
            ...item,
            mostrarAnterior: true,
            mostrarSiguiente: true,
            onAnterior: () => handleCancelarCiclo(item.id),
            onSiguiente: () => handleSalidaPuerto(item.id),
            onEditarFecha: editarFecha,
          }
        }
        if (item.estadoBackend === 'CLIENTE') {
          return {
            ...item,
            mostrarAnterior: true,
            mostrarSiguiente: true,
            onAnterior: () => handleRevertirSalida(item.id),
            onSiguiente: () => handleDevolucion(item.id),
            onEditarFecha: editarFecha,
          }
        }
        return { ...item, mostrarAnterior: false, mostrarSiguiente: false, onEditarFecha: editarFecha }
      })

  return (
    <div className="semaforo">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="seguimiento"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main>
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
      </main>

      {modalPuerto && (
        <ModalEntradaPuerto
          onConfirmar={handleEntradaPuerto}
          onCancelar={() => setModalPuerto(null)}
        />
      )}
      {modalFecha && (
        <ModalEditarFecha
          fechaActual={modalFecha.fechaInicioLibre}
          onConfirmar={handleEditarFecha}
          onCancelar={() => setModalFecha(null)}
        />
      )}
    </div>
  )
}

export default Semaforo
