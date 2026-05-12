import CeldaTabla from '../atomos/CeldaTabla'

function FilaNavieraTarifas({ naviera, valores = [] }) {
  return (
    <div className="fila-naviera-tarifas">
      <CeldaTabla label={naviera} tamanio="naviera" />
      <div className="fila-naviera-tarifas__celdas">
        {valores.map((v, i) => (
          <CeldaTabla key={i} label={String(v)} tamanio="sm" />
        ))}
      </div>
    </div>
  )
}

export default FilaNavieraTarifas
