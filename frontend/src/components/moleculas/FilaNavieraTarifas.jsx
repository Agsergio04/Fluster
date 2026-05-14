import CeldaTabla from '../atomos/CeldaTabla'

function FilaNavieraTarifas({ naviera, valores = [], editable = false, onCeldaChange }) {
  return (
    <div className="fila-naviera-tarifas">
      <CeldaTabla label={naviera} tamanio="naviera" />
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
