import BotonEditar from '../atomos/BotonEditar'
import BotonEliminar from '../atomos/BotonEliminar'

/**
 * Tarjeta de contenedor en la vista del operador.
 * Muestra foto opcional, código BIC y fecha de inclusión con acciones de editar y eliminar.
 */
function CardContenedor({ foto, codigoBic, fechaInclusion, onEditar, onEliminar }) {
  return (
    <div className="card-contenedor">
      <div className="card-contenedor__foto-wrapper">
        {foto && (
          <img
            className="card-contenedor__foto"
            src={foto}
            alt={codigoBic}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <div className="card-contenedor__bic">
        <span className="card-contenedor__bic-label">Codigo BIC</span>
        <span className="card-contenedor__bic-valor">{codigoBic}</span>
      </div>

      <div className="card-contenedor__fecha">
        <span className="card-contenedor__fecha-label">Fecha de Inclusion</span>
        <span className="card-contenedor__fecha-valor">{fechaInclusion}</span>
      </div>

      <div className="card-contenedor__botones">
        <BotonEditar onClick={onEditar} />
        <BotonEliminar onClick={onEliminar} />
      </div>
    </div>
  )
}

export default CardContenedor
