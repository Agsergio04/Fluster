import BotonCambioSeccion from '../atomos/BotonCambioSeccion'
import BotonIrIzquierda from '../atomos/BotonIrIzquierda'
import BotonIrDerecha from '../atomos/BotonIrDerecha'

/**
 * Paginador con botones de página numerados y flechas de anterior/siguiente.
 * Las flechas solo se renderizan cuando hay página anterior o siguiente,
 * respectivamente, para no mostrar controles sin efecto.
 */
function BotonesMovimientoCard({ paginaActual = 1, totalPaginas = 1, onCambiarPagina }) {
  return (
    <div className="botones-movimiento-card">
      {paginaActual > 1 && (
        <BotonIrIzquierda onClick={() => onCambiarPagina?.(paginaActual - 1)} />
      )}
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
        <BotonCambioSeccion
          key={pagina}
          active={pagina === paginaActual}
          onClick={() => onCambiarPagina?.(pagina)}
        >
          {pagina}
        </BotonCambioSeccion>
      ))}
      {paginaActual < totalPaginas && (
        <BotonIrDerecha onClick={() => onCambiarPagina?.(paginaActual + 1)} />
      )}
    </div>
  )
}

export default BotonesMovimientoCard
