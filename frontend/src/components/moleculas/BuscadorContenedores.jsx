import BuscadorCard from './BuscadorCard'

function BuscadorContenedores({ value, onChange, onBuscar }) {
  return (
    <div className="buscador-contenedores">
      <p className="buscador-contenedores__titulo">Buscador rápido</p>
      <BuscadorCard value={value} onChange={onChange} onBuscar={onBuscar} />
    </div>
  )
}

export default BuscadorContenedores
