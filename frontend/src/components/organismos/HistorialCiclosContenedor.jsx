import { useState } from 'react'
import TarjetaCicloContenedor from '../moleculas/TarjetaCicloContenedor'
import BotonesMovimientoCard from '../moleculas/BotonesMovimientoCard'

function HistorialCiclosContenedor({
  ciclos = [],
  ciclosPorPagina = 1,
  onCancelar,
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
            onEditarDemurrage={ciclo.onEditarDemurrage}
            onEditarDetention={ciclo.onEditarDetention}
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
