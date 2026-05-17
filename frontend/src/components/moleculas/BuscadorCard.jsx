import BotonBusqueda from '../atomos/BotonBusqueda'

function BuscadorCard({ value, onChange, onBuscar, placeholder = 'Buscar' }) {
  return (
    <search className="buscador-card">
      <input
        className="buscador-card__input"
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={e => e.key === 'Enter' && onBuscar?.()}
      />
      <BotonBusqueda onClick={onBuscar} />
    </search>
  )
}

export default BuscadorCard
