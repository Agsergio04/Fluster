import CabeceraTablasTarifasNavieras from '../moleculas/CabeceraTablasTarifasNavieras'
import FilaNavieraTarifasConBotones from '../moleculas/FilaNavieraTarifasConBotones'
import ConjuntoNavieras from './ConjuntoNavieras'

function TablaTarifas({ filas = [] }) {
  return (
    <>
      <div className="tabla-tarifas-wrapper tabla-tarifas-wrapper--desktop">
        <div className="tabla-tarifas">
          <CabeceraTablasTarifasNavieras />
          {filas.map((fila, i) => (
            <FilaNavieraTarifasConBotones
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
