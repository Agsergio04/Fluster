import CeldaTabla           from '../atomos/CeldaTabla'
import CabeceraTablasTarifas from './CabeceraTablasTarifas'

/**
 * Fila de cabecera completa de la tabla de navieras:
 * columna de nombre + cabecera de tarifas + espacio reservado para los botones de acción.
 * El div de acciones es aria-hidden porque los botones reales están en cada fila de datos
 * y ya tienen sus propios labels accesibles.
 */
function CabeceraTablasTarifasNavieras() {
  return (
    <div className="cabecera-tablas-tarifas-navieras">
      <CeldaTabla label="Navieras" tamanio="naviera" fuente="body" />
      <CabeceraTablasTarifas />
      <div className="cabecera-tablas-tarifas-navieras__acciones" aria-hidden="true" />
    </div>
  )
}

export default CabeceraTablasTarifasNavieras
