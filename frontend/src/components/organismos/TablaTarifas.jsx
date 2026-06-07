import { useState } from 'react'
import CabeceraTablasTarifasNavieras from '../moleculas/CabeceraTablasTarifasNavieras'
import FilaNavieraTarifasConBotones from '../moleculas/FilaNavieraTarifasConBotones'
import BuscadorCard from '../moleculas/BuscadorCard'
import ConjuntoCards from './ConjuntoCards'

/**
 * Tabla de tarifas de navieras con edición en línea.
 * En escritorio muestra la tabla completa; en móvil reutiliza ConjuntoCards
 * con la variante 'navieras', el mismo conjunto de tarjetas paginado (con buscador
 * y paginación) que usan el semáforo, el almacén y los contenedores.
 *
 * Cada fila lleva sus propios callbacks onActualizar y onEliminar inyectados
 * por la página de Tarifas, por lo que este componente no necesita conocer
 * ni los IDs ni la lógica de persistencia.
 *
 * @param {Array} filas - Filas con { naviera, valores, onActualizar, onEliminar }
 */
function TablaTarifas({ filas = [] }) {
  // El buscador del móvil vive aquí para poder pasar las filas ya filtradas a
  // ConjuntoCards (que espera los elementos prefiltrados por el componente padre).
  const [busqueda, setBusqueda] = useState('')

  const filasFiltradas = filas.filter(f =>
    !busqueda.trim() ||
    f.naviera?.toLowerCase().includes(busqueda.trim().toLowerCase())
  )

  return (
    <>
      <div className="tabla-tarifas-wrapper tabla-tarifas-wrapper--desktop">
        <div className="tabla-tarifas-desktop">
          <div className="tabla-tarifas-desktop__buscador">
            <BuscadorCard
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onBuscar={() => {}}
              placeholder="Buscar naviera..."
            />
          </div>
          <div className="tabla-tarifas">
            <CabeceraTablasTarifasNavieras />
            {filasFiltradas.map((fila) => (
              <FilaNavieraTarifasConBotones
                // La clave combina ID y valores para forzar re-mount si el servidor
                // devuelve una estructura diferente tras guardar
                key={(fila._id ?? fila.naviera) + '_' + (fila.valores ?? []).join(',')}
                naviera={fila.naviera}
                valores={fila.valores}
                onActualizar={fila.onActualizar}
                onEliminar={fila.onEliminar}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="tabla-tarifas-wrapper--movil">
        <ConjuntoCards
          variante="navieras"
          itemsPorPagina={3}
          busqueda={busqueda}
          onBusquedaCambio={e => setBusqueda(e.target.value)}
          onBuscar={() => {}}
          items={filasFiltradas}
        />
      </div>
    </>
  )
}

export default TablaTarifas
