import { useState, useEffect } from 'react'
import GrupoNavieraMovil from './GrupoNavieraMovil'
import BuscadorContenedores from '../moleculas/BuscadorContenedores'
import BotonesMovimientoCard from '../moleculas/BotonesMovimientoCard'

const ITEMS_POR_PAGINA = 5

function ConjuntoNavieras({ filas = [] }) {
  const [busqueda, setBusqueda] = useState('')
  const [pagina,   setPagina]   = useState(1)

  useEffect(() => { setPagina(1) }, [busqueda])

  const filasFiltradas = filas.filter(f =>
    !busqueda.trim() ||
    f.naviera?.toLowerCase().includes(busqueda.trim().toLowerCase())
  )

  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / ITEMS_POR_PAGINA))
  const inicio       = (pagina - 1) * ITEMS_POR_PAGINA
  const filasPagina  = filasFiltradas.slice(inicio, inicio + ITEMS_POR_PAGINA)

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
