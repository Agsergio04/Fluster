import CabeceraTablasTarifasNavieras from '../moleculas/CabeceraTablasTarifasNavieras'
import FilaNavieraTarifasConBotones from '../moleculas/FilaNavieraTarifasConBotones'
import GrupoNavieraMovil from './GrupoNavieraMovil'

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
        {filas.map((fila, i) => (
          <GrupoNavieraMovil
            key={fila.naviera ?? i}
            naviera={fila.naviera}
            valores={fila.valores}
            onActualizar={fila.onActualizar}
            onEliminar={fila.onEliminar}
          />
        ))}
      </div>
    </>
  )
}

export default TablaTarifas
