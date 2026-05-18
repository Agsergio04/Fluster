import CeldaTabla from '../atomos/CeldaTabla'

/**
 * Fila de la tabla de tarifas con el nombre de la naviera y sus 8 valores.
 * Cuando editable=true, cada celda de valor se convierte en un input controlado
 * que notifica al padre mediante onCeldaChange(índice, nuevoValor).
 *
 * @param {string}   naviera
 * @param {Array}    valores     - Array de 8 valores en el orden del modelo de tarifas
 * @param {boolean}  editable    - Activa los inputs en las celdas de valor
 * @param {function} onCeldaChange - (índice, valor) → void
 */
function FilaNavieraTarifas({ naviera, valores = [], editable = false, onCeldaChange }) {
  return (
    <div className="fila-naviera-tarifas">
      {/* La celda de naviera es siempre readonly para evitar editar el nombre accidentalmente */}
      <CeldaTabla label={naviera} tamanio="naviera" fuente="body" readonly />
      <div className="fila-naviera-tarifas__celdas">
        {valores.map((v, i) => (
          <CeldaTabla
            key={i}
            label={String(v)}
            tamanio="sm"
            editable={editable}
            onChange={val => onCeldaChange?.(i, val)}
          />
        ))}
      </div>
    </div>
  )
}

export default FilaNavieraTarifas
