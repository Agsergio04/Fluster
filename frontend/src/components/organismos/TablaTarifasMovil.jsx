function TablaTarifasMovil({ filas = [] }) {
  return (
    <div className="tabla-tarifas-movil">

      <div className="tabla-tarifas-movil__bloque">
        <p className="tabla-tarifas-movil__titulo">Tiempo (días)</p>
        <div className="tabla-tarifas-movil__scroll">
          <table className="tabla-tarifas-movil__tabla">
            <thead>
              <tr>
                <th>Naviera</th>
                <th>Free T. Det.</th>
                <th>Free T. Dem.</th>
                <th>Lím. T1 Det.</th>
                <th>Lím. T1 Dem.</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => (
                <tr key={i}>
                  <td>{fila.naviera}</td>
                  <td>{fila.valores[0]}</td>
                  <td>{fila.valores[1]}</td>
                  <td>{fila.valores[2]}</td>
                  <td>{fila.valores[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="tabla-tarifas-movil__bloque">
        <p className="tabla-tarifas-movil__titulo">Costes por día (€)</p>
        <div className="tabla-tarifas-movil__scroll">
          <table className="tabla-tarifas-movil__tabla">
            <thead>
              <tr>
                <th>Naviera</th>
                <th>T1 Det. €/d</th>
                <th>T1 Dem. €/d</th>
                <th>T2 Det. €/d</th>
                <th>T2 Dem. €/d</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => (
                <tr key={i}>
                  <td>{fila.naviera}</td>
                  <td>{fila.valores[4]}</td>
                  <td>{fila.valores[5]}</td>
                  <td>{fila.valores[6]}</td>
                  <td>{fila.valores[7]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default TablaTarifasMovil
