import CeldaTabla           from '../atomos/CeldaTabla'
import CabeceraTablasTarifas from './CabeceraTablasTarifas'

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
