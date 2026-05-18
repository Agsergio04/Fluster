import BotonBusqueda from '../atomos/BotonBusqueda'

/**
 * Campo de búsqueda con botón integrado.
 * Usa el elemento semántico `<search>` (HTML5) en lugar de un div.
 * Enter dispara la búsqueda igual que el botón para no obligar al usuario
 * a usar el ratón.
 */
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
