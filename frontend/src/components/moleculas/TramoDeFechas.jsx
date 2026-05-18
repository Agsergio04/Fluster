import CalendarioIcon from '../../assets/icons/Icono calendario.svg?react'
import BotonEditadoFechaContenedor from '../atomos/BotonEditadoFechaContenedor'

/**
 * Formatea un valor de fecha a dd/mm/aaaa.
 * Si el valor es nulo, vacío o no parseable devuelve '-' en lugar de 'Invalid Date'
 * para que la UI nunca muestre texto de error del motor JS.
 */
const formatFecha = (valor) => {
  if (!valor) return '-'
  const d = new Date(valor)
  return isNaN(d) ? valor : d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Sección de fechas de inicio y fin de un tramo (Demurrage o Detention)
 * con botón de edición para corregir errores de registro.
 *
 * @param {string}   titulo      - 'Demurrage' | 'Detention'
 * @param {string}   fechaInicio - Fecha en ISO o compatible con Date()
 * @param {string}   fechaFin
 * @param {function} onEditar    - Abre el modal de edición de fechas del tramo
 */
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
          <span className="tramo-de-fechas__valor">{formatFecha(fechaInicio)}</span>
        </div>

        <div className="tramo-de-fechas__fila">
          <div className="tramo-de-fechas__etiqueta">
            <CalendarioIcon aria-hidden="true" />
            <span>Fecha de fin</span>
          </div>
          <span className="tramo-de-fechas__valor">{formatFecha(fechaFin)}</span>
        </div>
      </div>
    </div>
  )
}

export default TramoDeFechas
