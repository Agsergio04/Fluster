import CalendarioIcon from '../../assets/icons/Icono calendario.svg?react'
import BotonEditadoFechaContenedor from '../atomos/BotonEditadoFechaContenedor'

function TramoDeFechas({ titulo, fechaInicio, fechaFin, onEditar }) {
  return (
    <div className="tramo-de-fechas">
      <div className="tramo-de-fechas__cabecera">
        <h3 className="tramo-de-fechas__titulo">{titulo}</h3>
        <BotonEditadoFechaContenedor onClick={onEditar} />
      </div>

      <div className="tramo-de-fechas__fechas">
        <div className="tramo-de-fechas__fila">
          <div className="tramo-de-fechas__etiqueta">
            <CalendarioIcon aria-hidden="true" />
            <span>Fecha de inicio</span>
          </div>
          <span className="tramo-de-fechas__valor">{fechaInicio}</span>
        </div>

        <div className="tramo-de-fechas__fila">
          <div className="tramo-de-fechas__etiqueta">
            <CalendarioIcon aria-hidden="true" />
            <span>Fecha de fin</span>
          </div>
          <span className="tramo-de-fechas__valor">{fechaFin}</span>
        </div>
      </div>
    </div>
  )
}

export default TramoDeFechas
