import { useState, useEffect } from 'react'
import CabeceraTramo from '../atomos/CabeceraTramo'
import BuscadorContenedores from '../moleculas/BuscadorContenedores'
import BotonesMovimientoCard from '../moleculas/BotonesMovimientoCard'
import CardSemaforo from './CardSemaforo'
import CardUsuario from '../moleculas/CardUsuario'
import CardContenedoresAlmacen from '../moleculas/CardContenedoresAlmacen'
import CardContenedor from '../moleculas/CardContenedor'
import GrupoNavieraMovil from './GrupoNavieraMovil'

// En móvil se muestran menos tarjetas para que quepan en pantalla sin scroll excesivo
const MOVIL_QUERY = '(max-width: 1023px)'
const ITEMS_MOVIL  = 3

/**
 * Contenedor paginado de tarjetas reutilizable para cinco variantes:
 * 'semaforo', 'usuarios', 'almacen', 'contenedores' y 'navieras'.
 * La paginación se adapta automáticamente al ancho de pantalla
 * escuchando el MediaQueryList para no depender de resize events.
 *
 * @param {'semaforo'|'usuarios'|'almacen'|'contenedores'|'navieras'} variante
 * @param {object[]} items           - Elementos ya filtrados por la página padre
 * @param {number}   itemsPorPagina  - Columnas visibles en escritorio
 */
function ConjuntoCards({
  variante = 'semaforo',
  tramo,
  busqueda = '',
  onBusquedaCambio,
  onBuscar,
  items = [],
  itemsPorPagina = 6,
  onVerRegistro,
  onBorrar,
  onEditar,
  onEliminar,
  onCambiarRol,
}) {
  const [pagina,       setPagina]       = useState(1)
  // Inicialización directa con la query para evitar un flash de paginación incorrecta
  const [itemsActivos, setItemsActivos] = useState(
    () => window.matchMedia(MOVIL_QUERY).matches ? ITEMS_MOVIL : itemsPorPagina
  )

  useEffect(() => {
    const mq      = window.matchMedia(MOVIL_QUERY)
    const handler = e => {
      setItemsActivos(e.matches ? ITEMS_MOVIL : itemsPorPagina)
      setPagina(1)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [itemsPorPagina])

  // Volver a la primera página cada vez que cambia la búsqueda, sin useEffect
  // (patrón recomendado de ajustar el estado durante el render).
  const [busquedaPrev, setBusquedaPrev] = useState(busqueda)
  if (busqueda !== busquedaPrev) {
    setBusquedaPrev(busqueda)
    setPagina(1)
  }

  const totalPaginas = Math.max(1, Math.ceil(items.length / itemsActivos))
  // Acota la página guardada por si la lista encogió (al borrar el último
  // elemento de la última página); si no, la vista quedaría en blanco.
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio       = (paginaActual - 1) * itemsActivos
  const paginaItems  = items.slice(inicio, inicio + itemsActivos)

  const renderCard = (item, i) => {
    const key = item.id ?? inicio + i
    switch (variante) {
      case 'semaforo':
        return <CardSemaforo key={key} {...item} />
      case 'usuarios':
        return <CardUsuario key={key} {...item} onCambiarRol={rol => onCambiarRol?.(item, rol)} onEliminar={() => onEliminar?.(item)} />
      case 'almacen':
        return <CardContenedoresAlmacen key={key} {...item} onVerRegistro={() => onVerRegistro?.(item)} onBorrar={() => onBorrar?.(item)} />
      case 'contenedores':
        return <CardContenedor key={key} {...item} onEditar={() => onEditar?.(item)} onEliminar={() => onEliminar?.(item)} />
      case 'navieras':
        // La clave combina naviera y valores para forzar el re-mount tras guardar,
        // igual que hacía ConjuntoNavieras, y que el estado interno del formulario se reinicie.
        return (
          <GrupoNavieraMovil
            key={(item._id ?? item.naviera) + '_' + (item.valores ?? []).join(',')}
            naviera={item.naviera}
            valores={item.valores}
            onActualizar={item.onActualizar}
            onEliminar={item.onEliminar}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={`conjunto-cards conjunto-cards--${variante}`}>
      {variante === 'semaforo' && tramo && (
        <CabeceraTramo tramo={tramo} cantidad={items.length} />
      )}
      <BuscadorContenedores
        value={busqueda}
        onChange={onBusquedaCambio}
        onBuscar={onBuscar}
      />
      {items.length === 0 ? (
        <p className="conjunto-cards__vacio" role="status">No hay elementos</p>
      ) : (
        <div className="conjunto-cards__grid">
          {paginaItems.map((item, i) => renderCard(item, i))}
        </div>
      )}
      {totalPaginas > 1 && (
        <BotonesMovimientoCard
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambiarPagina={setPagina}
        />
      )}
    </div>
  )
}

export default ConjuntoCards
