import CabeceraTablasTarifasNavieras from '../moleculas/CabeceraTablasTarifasNavieras'
import FilaNavieraTarifasConBotones from '../moleculas/FilaNavieraTarifasConBotones'

function TablaTarifas({ filas = [] }) {
  return (
    <div className="tabla-tarifas-wrapper">
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
  )
}

export default TablaTarifas
