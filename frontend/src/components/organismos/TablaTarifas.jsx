import CabeceraTablasTarifasNavieras from '../moleculas/CabeceraTablasTarifasNavieras'
import FilaNavieraTarifasConBotones from '../moleculas/FilaNavieraTarifasConBotones'
import TablaTarifasMovil from './TablaTarifasMovil'

function TablaTarifas({ filas = [] }) {
  return (
    <>
      <div className="tabla-tarifas-wrapper tabla-tarifas-wrapper--desktop">
        <div className="tabla-tarifas">
          <CabeceraTablasTarifasNavieras />
          {filas.map((fila, i) => (
            <FilaNavieraTarifasConBotones
              key={fila.naviera ?? i}
              naviera={fila.naviera}
              valores={fila.valores}
              onActualizar={fila.onActualizar}
              onEliminar={fila.onEliminar}
            />
          ))}
        </div>
      </div>

      <div className="tabla-tarifas-wrapper--movil">
        <TablaTarifasMovil filas={filas} />
      </div>
    </>
  )
}

export default TablaTarifas
