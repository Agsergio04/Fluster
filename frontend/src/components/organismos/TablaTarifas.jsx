import CabeceraTablasTarifasNavieras from '../moleculas/CabeceraTablasTarifasNavieras'
import FilaNavieraTarifasConBotones from '../moleculas/FilaNavieraTarifasConBotones'
import ConjuntoNavieras from './ConjuntoNavieras'

/**
 * Tabla de tarifas de navieras con edición en línea.
 * En escritorio muestra la tabla completa; en móvil usa ConjuntoNavieras,
 * que agrupa los mismos datos en un formato vertical más legible.
 *
 * Cada fila lleva sus propios callbacks onActualizar y onEliminar inyectados
 * por la página de Tarifas, por lo que este componente no necesita conocer
 * ni los IDs ni la lógica de persistencia.
 *
 * @param {Array} filas - Filas con { naviera, valores, onActualizar, onEliminar }
 */
function TablaTarifas({ filas = [] }) {
  return (
    <>
      <div className="tabla-tarifas-wrapper tabla-tarifas-wrapper--desktop">
        <div className="tabla-tarifas">
          <CabeceraTablasTarifasNavieras />
          {filas.map((fila, i) => (
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

      <div className="tabla-tarifas-wrapper--movil">
        <ConjuntoNavieras filas={filas} />
      </div>
    </>
  )
}

export default TablaTarifas
