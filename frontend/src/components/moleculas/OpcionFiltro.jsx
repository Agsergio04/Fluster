function OpcionFiltro({ label, selected = false, onClick }) {
  return (
    <button
      type="button"
      className={`opcion-filtro${selected ? ' opcion-filtro--seleccionada' : ''}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="opcion-filtro__circulo" aria-hidden="true" />
      <span className="opcion-filtro__label">{label}</span>
    </button>
  )
}

export default OpcionFiltro
