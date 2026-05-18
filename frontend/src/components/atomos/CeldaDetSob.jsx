import CeldaTabla from './CeldaTabla'

/** Par de celdas Detención/Sobrestadía para la cabecera de la tabla de tarifas. */
function CeldaDetSob() {
  return (
    <div className="celda-det-sob">
      <CeldaTabla label="Detencion"   tamanio="sm" fuente="body" />
      <CeldaTabla label="Sobrestadía" tamanio="sm" fuente="body" />
    </div>
  )
}

export default CeldaDetSob
