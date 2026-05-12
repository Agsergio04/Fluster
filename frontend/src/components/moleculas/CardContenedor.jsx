import BotonEditar from '../atomos/BotonEditar'
import BotonEliminar from '../atomos/BotonEliminar'

function CardContenedor({ foto, codigoBic, fechaInclusion, onEditar, onEliminar }) {
  return (
    <div className="card-contenedor">
      <div className="card-contenedor__foto-wrapper">
        {foto && (
          <img
            className="card-contenedor__foto"
            src={foto}
            alt={codigoBic}
          />
        )}
      </div>

      <div className="card-contenedor__bic">
        <p className="card-contenedor__bic-label">Codigo BIC</p>
        <p className="card-contenedor__bic-valor">{codigoBic}</p>
      </div>

      <div className="card-contenedor__fecha">
        <p className="card-contenedor__fecha-label">Fecha de Inclusion</p>
        <p className="card-contenedor__fecha-valor">{fechaInclusion}</p>
      </div>

      <div className="card-contenedor__botones">
        <BotonEditar onClick={onEditar} />
        <BotonEliminar onClick={onEliminar} />
      </div>
    </div>
  )
}

export default CardContenedor
