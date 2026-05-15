import { useState, useEffect } from 'react'
import CabeceraTramo from '../atomos/CabeceraTramo'
import BuscadorContenedores from '../moleculas/BuscadorContenedores'
import BotonesMovimientoCard from '../moleculas/BotonesMovimientoCard'
import CardSemaforo from './CardSemaforo'
import CardUsuario from '../moleculas/CardUsuario'
import CardContenedoresAlmacen from '../moleculas/CardContenedoresAlmacen'
import CardContenedor from '../moleculas/CardContenedor'

const MOVIL_QUERY = '(max-width: 1023px)'
const ITEMS_MOVIL  = 3

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

  useEffect(() => { setPagina(1) }, [busqueda])

  const totalPaginas = Math.max(1, Math.ceil(items.length / itemsActivos))
  const inicio       = (pagina - 1) * itemsActivos
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
        <p className="conjunto-cards__vacio">No hay elementos</p>
      ) : (
        <div className="conjunto-cards__grid">
          {paginaItems.map((item, i) => renderCard(item, i))}
        </div>
      )}
      {totalPaginas > 1 && (
        <BotonesMovimientoCard
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          onCambiarPagina={setPagina}
        />
      )}
    </div>
  )
}

export default ConjuntoCards
