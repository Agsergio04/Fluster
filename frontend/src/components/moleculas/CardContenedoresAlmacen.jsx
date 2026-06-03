import CalendarioIcon from '../../assets/icons/Icono calendario.svg?react'
import PerfilIcon from '../../assets/icons/Icono Perfil.svg?react'
import BotonCardAlmacen from '../atomos/BotonCardAlmacen'

/**
 * Tarjeta de contenedor en la vista de almacén (gestor).
 * El botón de borrar solo está activo cuando el contenedor está en estado INACTIVO;
 * si tiene un ciclo activo el backend lo rechazaría de todos modos, pero
 * deshabilitarlo aquí evita la llamada y da feedback visual inmediato.
 *
 * @param {string} codigoBic
 * @param {string} estado          - Estado actual del contenedor (p. ej. 'INACTIVO')
 * @param {string} ultimaOperacion - Fecha de la última transición formateada
 * @param {string} fechaInclusion  - Fecha de entrada al almacén formateada
 * @param {string} operador        - Nombre del operador que registró el contenedor
 * @param {function} onVerRegistro - Navega al historial de ciclos
 * @param {function} onBorrar      - Elimina el contenedor (solo INACTIVO)
 */
function CardContenedoresAlmacen({
  codigoBic,
  estado,
  ultimaOperacion,
  fechaInclusion,
  operador,
  onVerRegistro,
  onBorrar,
}) {
  return (
    <div className="card-almacen">
      <div className="card-almacen__bic">
        <span className="card-almacen__etiqueta">Código BIC :</span>
        <span className="card-almacen__valor">{codigoBic}</span>
      </div>

      <div className="card-almacen__fila-fecha">
        <div className="card-almacen__fecha-izq">
          <div className="card-almacen__icono-label">
            <CalendarioIcon className="card-almacen__icono" aria-hidden="true" />
            <p className="card-almacen__etiqueta-sm">Última operación :</p>
          </div>
          <p className="card-almacen__valor-sm">{ultimaOperacion}</p>
        </div>
      </div>

      <div className="card-almacen__fila-fecha">
        <div className="card-almacen__fecha-izq">
          <div className="card-almacen__icono-label">
            <CalendarioIcon className="card-almacen__icono" aria-hidden="true" />
            <p className="card-almacen__etiqueta-sm">Fecha de inclusión :</p>
          </div>
          <p className="card-almacen__valor-sm">{fechaInclusion}</p>
        </div>
      </div>

      <div className="card-almacen__fila-operador">
        <div className="card-almacen__icono-label">
          <PerfilIcon className="card-almacen__icono" aria-hidden="true" />
          <p className="card-almacen__etiqueta-sm">Operador :</p>
        </div>
        <p className="card-almacen__valor-sm">{operador}</p>
      </div>

      <div className="card-almacen__acciones">
        <BotonCardAlmacen variante="ver-registro" onClick={onVerRegistro} />
        <BotonCardAlmacen variante="borrar" onClick={onBorrar} disabled={estado !== 'INACTIVO'} />
      </div>
    </div>
  )
}

export default CardContenedoresAlmacen
