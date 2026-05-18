import { useState } from 'react'
import TarjetaCicloContenedor from '../moleculas/TarjetaCicloContenedor'
import BotonesMovimientoCard from '../moleculas/BotonesMovimientoCard'

/**
 * Lista paginada de ciclos históricos de un contenedor.
 * Por defecto muestra un ciclo por página para que los datos de cada ciclo
 * tengan suficiente espacio sin necesidad de scroll.
 * Los botones de editar fechas permiten corregir Demurrage y Detention de
 * ciclos ya cerrados si los datos fueron registrados incorrectamente.
 *
 * @param {object[]} ciclos         - Ciclos del contenedor ordenados por fecha
 * @param {number}   ciclosPorPagina
 * @param {function} onCancelar      - Cierra el historial sin guardar cambios
 * @param {function} onEditarDemurrage - Recibe el ciclo seleccionado
 * @param {function} onEditarDetention
 */
function HistorialCiclosContenedor({
  ciclos = [],
  ciclosPorPagina = 1,
  onCancelar,
  onEditarDemurrage,
  onEditarDetention,
}) {
  const [paginaActual, setPaginaActual] = useState(1)

  const totalPaginas = Math.max(1, Math.ceil(ciclos.length / ciclosPorPagina))
  const inicio       = (paginaActual - 1) * ciclosPorPagina
  const ciclosPagina = ciclos.slice(inicio, inicio + ciclosPorPagina)

  return (
    <div className="historial-ciclos-contenedor">
      <div className="historial-ciclos-contenedor__ciclos">
        {ciclosPagina.map((ciclo, i) => (
          <TarjetaCicloContenedor
            key={inicio + i}
            cliente={ciclo.cliente}
            demurrage={ciclo.demurrage}
            detention={ciclo.detention}
            onEditarDemurrage={() => onEditarDemurrage?.(ciclo)}
            onEditarDetention={() => onEditarDetention?.(ciclo)}
          />
        ))}
      </div>

      <BotonesMovimientoCard
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onCambiarPagina={setPaginaActual}
      />

      <button
        type="button"
        className="historial-ciclos-contenedor__btn-cancelar"
        onClick={onCancelar}
      >
        Cancelar
      </button>
    </div>
  )
}

export default HistorialCiclosContenedor
