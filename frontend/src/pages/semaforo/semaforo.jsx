import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './semaforo.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { getUsuario } from '../../services/session'
import { obtenerAgrupados } from '../../services/semaforoService'
import { crearCliente } from '../../services/clienteService'
import { entradaPuerto, salidaPuerto, cancelarCiclo, revertirSalidaPuerto, devolucion } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import CabeceraTramo from '../../components/atomos/CabeceraTramo'
import BuscadorCard from '../../components/moleculas/BuscadorCard'
import CardSemaforo from '../../components/organismos/CardSemaforo'
import BotonesMovimientoCard from '../../components/moleculas/BotonesMovimientoCard'
import ModalEntradaPuerto from '../../components/organismos/ModalEntradaPuerto'
import Notificacion from '../../components/atomos/Notificacion'

// Orden de las columnas del semáforo tal como las muestra la interfaz
const TRAMOS = ['sin-coste', 'primer-tramo', 'segundo-tramo', 'inactivo']

// Máximo de tarjetas visibles por columna; a partir de aquí aparece el paginador
const CARDS_POR_COLUMNA = 2

// Sufijo que se añade al estado backend para generar la variante visual de la tarjeta
// (p. ej. "puerto-free", "puerto-primer", "cliente-segundo")
const TRAMO_SUFIJO = {
  'sin-coste':     'free',
  'primer-tramo':  'primer',
  'segundo-tramo': 'segundo',
}

/**
 * Devuelve la fecha más reciente de un contenedor formateada en español.
 * El recorrido va de la más reciente (devolución) a la más antigua (inicio libre)
 * para mostrar siempre el último evento conocido en la tarjeta del semáforo.
 *
 * @param {object} c - Contenedor tal como llega del servidor
 * @returns {string} Fecha formateada o '-' si no hay ninguna
 */
const ultimaFecha = c => {
  const fecha = c.fechaDevolucion
    ?? c.fechaSalidaPuerto
    ?? c.fechaEntradaPuerto
  return fecha
    ? new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '-'
}

/**
 * Transforma un contenedor tal como llega del servidor en el objeto
 * normalizado que espera el componente CardContenedor.
 * El campo estado combina el estado del backend con el tramo de tarifa
 * activo para que la tarjeta muestre el color correcto.
 *
 * @param {object} c     - Contenedor del servidor
 * @param {string} tramo - Clave del tramo ('sin-coste' | 'primer-tramo' | ...)
 */
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
    cliente:          c._semaforo?.cliente ?? null,
    tarifaAcumulada:  c._semaforo?.costeAcumulado ?? 0,
  }
}

/**
 * Página principal de gestión operativa del gestor.
 * Muestra cuatro columnas (sin coste, primer tramo, segundo tramo e inactivos)
 * con las tarjetas de todos los contenedores activos, y permite ejecutar
 * todas las transiciones de estado del ciclo de vida de un contenedor.
 */
function Semaforo() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()
  useDocumentTitle('Semáforo | Fluster')

  // Buscador único que filtra todas las columnas a la vez
  const [busqueda, setBusqueda] = useState('')
  // Página activa de cada columna ({ tramo: nº }); las no presentes están en la 1
  const [paginas, setPaginas] = useState({})
  // Contenedores agrupados por tramo de coste
  const [grupos,      setGrupos]      = useState({
    'sin-coste': [], 'primer-tramo': [], 'segundo-tramo': [], 'inactivo': [],
  })
  // Datos del contenedor sobre el que se quiere abrir el modal de entrada a puerto
  const [modalPuerto,  setModalPuerto]  = useState(null)
  const [aviso,        setAviso]        = useState('')
  const [cargando,     setCargando]     = useState(true)
  // IDs de contenedores con una transición en curso; evita dobles clics que
  // encadenarían dos transiciones (p.ej. CLIENTE→PUERTO y PUERTO→INACTIVO)
  const transicionando = useRef(new Set())

  /**
   * Pide al servidor los contenedores ya clasificados por tramo y actualiza
   * el estado local. Se usa useCallback para estabilizar la referencia y
   * poder llamarlo desde distintos manejadores sin recrear la función.
   */
  const cargarGrupos = useCallback(() => {
    obtenerAgrupados()
      .then(data => setGrupos({
        'sin-coste':     (data.freeTime     ?? []).map(c => mapearContenedor(c, 'sin-coste')),
        'primer-tramo':  (data.primerTramo  ?? []).map(c => mapearContenedor(c, 'primer-tramo')),
        'segundo-tramo': (data.segundoTramo ?? []).map(c => mapearContenedor(c, 'segundo-tramo')),
        'inactivo':      (data.inactivos    ?? []).map(c => mapearContenedor(c, 'inactivo')),
      }))
      .catch(() => setAviso('No se pudieron cargar los contenedores'))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { cargarGrupos() }, [cargarGrupos])

  /**
   * Crea el cliente si no existe y registra la entrada a puerto del contenedor.
   * Se separa la creación del cliente de la transición de estado porque el modal
   * solo recoge el nombre: el ID real lo devuelve el servidor tras el POST.
   *
   * @param {string} nombre - Nombre del cliente introducido en el modal
   */
  const handleEntradaPuerto = async (nombre) => {
    const cid = modalPuerto?.id
    // Guard contra doble confirmación del modal (doble clic / Enter + clic).
    if (!cid || transicionando.current.has(cid)) return
    transicionando.current.add(cid)
    try {
      const cliente = await crearCliente(nombre)
      await entradaPuerto(cid, cliente._id)
      setModalPuerto(null)
      cargarGrupos()
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo registrar la entrada a puerto')
    } finally {
      transicionando.current.delete(cid)
    }
  }

  /** Cancela el ciclo activo y devuelve el contenedor a INACTIVO. */
  const handleCancelarCiclo = async (id) => {
    if (transicionando.current.has(id)) return
    transicionando.current.add(id)
    try {
      await cancelarCiclo(id)
      cargarGrupos()
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo cancelar el ciclo')
    } finally {
      transicionando.current.delete(id)
    }
  }

  /** Registra la salida de puerto: el contenedor pasa de PUERTO a CLIENTE. */
  const handleSalidaPuerto = async (id) => {
    if (transicionando.current.has(id)) return
    transicionando.current.add(id)
    try {
      await salidaPuerto(id)
      cargarGrupos()
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo registrar la salida a puerto')
    } finally {
      transicionando.current.delete(id)
    }
  }

  /**
   * Revierte la salida a cliente: el contenedor vuelve de CLIENTE a PUERTO.
   * Útil para corregir un registro de salida introducido por error.
   */
  const handleRevertirSalida = async (id) => {
    if (transicionando.current.has(id)) return
    transicionando.current.add(id)
    try {
      await revertirSalidaPuerto(id)
      cargarGrupos()
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo revertir la salida')
    } finally {
      transicionando.current.delete(id)
    }
  }

  /** Registra la devolución del contenedor: pasa de CLIENTE a INACTIVO. */
  const handleDevolucion = async (id) => {
    if (transicionando.current.has(id)) return
    transicionando.current.add(id)
    try {
      await devolucion(id)
      cargarGrupos()
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo registrar la devolucion')
    } finally {
      transicionando.current.delete(id)
    }
  }

  /**
   * Filtra los contenedores de un tramo por el texto de búsqueda
   * y añade a cada ítem los manejadores de acción correspondientes
   * según su estado en el backend:
   *   - INACTIVO → botón "Siguiente" abre el modal de entrada a puerto
   *   - PUERTO   → "Anterior" cancela el ciclo, "Siguiente" registra salida
   *   - CLIENTE  → "Anterior" revierte la salida, "Siguiente" registra devolución
   *
   * @param {string} tramo - Clave de la columna a procesar
   */
  const itemsFiltrados = tramo => {
    const consulta = busqueda.trim().toLowerCase()
    return grupos[tramo]
      .filter(item =>
        !consulta ||
        // Coincidencia por código BIC, nombre de cliente o fecha de última
        // operación (tal como se muestra en la tarjeta, formato es-ES)
        [item.codigoBic, item.cliente, item.ultimaOperacion]
          .some(campo => campo?.toLowerCase().includes(consulta))
      )
      .map(item => {
        if (tramo === 'inactivo') {
          return { ...item, mostrarAnterior: false, mostrarSiguiente: true, onSiguiente: () => setModalPuerto({ id: item.id }) }
        }
        if (item.estadoBackend === 'PUERTO') {
          return {
            ...item,
            mostrarAnterior: true,
            mostrarSiguiente: true,
            onAnterior: () => handleCancelarCiclo(item.id),
            onSiguiente: () => handleSalidaPuerto(item.id),
          }
        }
        if (item.estadoBackend === 'CLIENTE') {
          return {
            ...item,
            mostrarAnterior: true,
            mostrarSiguiente: true,
            onAnterior: () => handleRevertirSalida(item.id),
            onSiguiente: () => handleDevolucion(item.id),
          }
        }
        return { ...item, mostrarAnterior: false, mostrarSiguiente: false }
      })
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
        <section className="semaforo__intro">
          <h1 className="semaforo__titulo">Estado de los contenedores</h1>
          <p className="semaforo__subtitulo">
            Visualización en tiempo real del estado de los contenedores y los costes
            asociados a la detención y sobreestadía de dichos contenedores
          </p>
        </section>

        {cargando ? (
          <p className="semaforo__cargando">Cargando contenedores...</p>
        ) : (
          <div className="semaforo__panel">
            {/* Buscador global por código BIC */}
            <div className="semaforo__buscador">
              <BuscadorCard
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                onBuscar={() => {}}
                placeholder="Buscar por código BIC, cliente o fecha..."
              />
            </div>

            {/* Tablero: una columna por tramo */}
            <div className="semaforo__tablero">
              {TRAMOS.map(tramo => {
                const items        = itemsFiltrados(tramo)
                const totalPaginas = Math.max(1, Math.ceil(items.length / CARDS_POR_COLUMNA))
                // Acotamos la página guardada por si la lista encogió (filtro, recarga)
                const paginaActual = Math.min(paginas[tramo] ?? 1, totalPaginas)
                const inicio       = (paginaActual - 1) * CARDS_POR_COLUMNA
                const visibles     = items.slice(inicio, inicio + CARDS_POR_COLUMNA)
                return (
                  <section key={tramo} className="semaforo__columna">
                    <CabeceraTramo tramo={tramo} cantidad={items.length} />
                    <div className="semaforo__columna-cards">
                      {items.length === 0 ? (
                        <p className="semaforo__vacio" role="status">Sin contenedores</p>
                      ) : (
                        visibles.map(item => <CardSemaforo key={item.id} {...item} />)
                      )}
                    </div>
                    {totalPaginas > 1 && (
                      <BotonesMovimientoCard
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        onCambiarPagina={p => setPaginas(prev => ({ ...prev, [tramo]: p }))}
                      />
                    )}
                  </section>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {modalPuerto && (
        <ModalEntradaPuerto
          onConfirmar={handleEntradaPuerto}
          onCancelar={() => setModalPuerto(null)}
        />
      )}
      <Notificacion mensaje={aviso} onCerrar={() => setAviso('')} />
    </>
  )
}

export default Semaforo
