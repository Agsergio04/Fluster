import BotonBusqueda from '../atomos/BotonBusqueda'

function BuscadorCard({ value, onChange, onBuscar, placeholder = 'Buscar' }) {
  return (
    <div className="buscador-card">
      <input
        className="buscador-card__input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <BotonBusqueda onClick={onBuscar} />
    </div>
  )
}

export default BuscadorCard
