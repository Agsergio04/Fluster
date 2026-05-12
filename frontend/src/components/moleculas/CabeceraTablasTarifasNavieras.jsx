import CeldaTabla           from '../atomos/CeldaTabla'
import CabeceraTablasTarifas from './CabeceraTablasTarifas'

function CabeceraTablasTarifasNavieras() {
  return (
    <div className="cabecera-tablas-tarifas-navieras">
      <CeldaTabla label="Navieras" tamanio="naviera" />
      <CabeceraTablasTarifas />
    </div>
  )
}

export default CabeceraTablasTarifasNavieras
