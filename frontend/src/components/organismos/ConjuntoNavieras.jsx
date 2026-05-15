import { useState, useEffect } from 'react'
import GrupoNavieraMovil from './GrupoNavieraMovil'
import BuscadorContenedores from '../moleculas/BuscadorContenedores'
import BotonesMovimientoCard from '../moleculas/BotonesMovimientoCard'

const isMobile = () => window.matchMedia('(max-width: 767px)').matches

function ConjuntoNavieras({ filas = [] }) {
  const [busqueda,       setBusqueda]       = useState('')
  const [pagina,         setPagina]         = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(() => isMobile() ? 3 : 5)

  useEffect(() => {
    const mq      = window.matchMedia('(max-width: 767px)')
    const handler = e => {
      setItemsPorPagina(e.matches ? 3 : 5)
      setPagina(1)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => { setPagina(1) }, [busqueda])

  const filasFiltradas = filas.filter(f =>
    !busqueda.trim() ||
    f.naviera?.toLowerCase().includes(busqueda.trim().toLowerCase())
  )

  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / itemsPorPagina))
  const inicio       = (pagina - 1) * itemsPorPagina
  const filasPagina  = filasFiltradas.slice(inicio, inicio + itemsPorPagina)

  return (
    <div className="conjunto-navieras">
      <BuscadorContenedores
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        onBuscar={() => {}}
      />

      {filasPagina.length === 0 ? (
        <p className="conjunto-navieras__vacio">No hay navieras</p>
      ) : (
        <div className="conjunto-navieras__lista">
          {filasPagina.map((fila, i) => (
            <GrupoNavieraMovil
              key={fila.naviera ?? inicio + i}
              naviera={fila.naviera}
              valores={fila.valores}
              onActualizar={fila.onActualizar}
              onEliminar={fila.onEliminar}
            />
          ))}
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

export default ConjuntoNavieras
