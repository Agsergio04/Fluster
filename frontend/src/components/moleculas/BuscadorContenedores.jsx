import BuscadorCard from './BuscadorCard'

/** Sección con título y campo de búsqueda para filtrar listas de tarjetas. */
function BuscadorContenedores({ value, onChange, onBuscar }) {
  return (
    <section className="buscador-contenedores" aria-label="Buscador rápido">
      <h2 className="buscador-contenedores__titulo">Buscador rápido</h2>
      <BuscadorCard value={value} onChange={onChange} onBuscar={onBuscar} />
    </section>
  )
}

export default BuscadorContenedores
