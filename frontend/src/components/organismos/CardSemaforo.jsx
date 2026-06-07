import CabeceraSemaforoCard from '../moleculas/CabeceraSemaforoCard'
import CalendarioIcon from '../../assets/icons/Icono calendario.svg?react'
import PerfilIcon from '../../assets/icons/Icono Perfil.svg?react'
import TarifasIcon from '../../assets/icons/Icono Tarifas.svg?react'

/**
 * Tarjeta de seguimiento de un contenedor en el semáforo.
 * La sección de tarifa acumulada solo se muestra si el contenedor
 * tiene un ciclo activo (estado !== 'inactivo'), ya que en estado
 * inactivo no hay costes en curso.
 *
 * @param {'inactivo'|'puerto'|'cliente'|'vuelta_puerto'} estado
 * @param {string}   codigoBic
 * @param {string}   ultimaOperacion - Fecha de la última transición de estado
 * @param {string}   cliente         - Nombre del cliente o null si no asignado
 * @param {number}   tarifaAcumulada - Coste acumulado hasta el momento (€)
 * @param {boolean}  mostrarAnterior - Controla el botón de navegación izquierda
 * @param {boolean}  mostrarSiguiente
 * @param {function} onAnterior
 * @param {function} onSiguiente
 */
function CardSemaforo({
  estado = 'inactivo',
  codigoBic,
  ultimaOperacion,
  cliente,
  tarifaAcumulada,
  mostrarAnterior = false,
  mostrarSiguiente = true,
  onAnterior,
  onSiguiente,
}) {
  return (
    <div className="card-semaforo">
      <CabeceraSemaforoCard
        estado={estado}
        mostrarAnterior={mostrarAnterior}
        mostrarSiguiente={mostrarSiguiente}
        onAnterior={onAnterior}
        onSiguiente={onSiguiente}
      />

      <p className="card-semaforo__bic">{codigoBic}</p>

      <div className="card-semaforo__datos">
        <div className="card-semaforo__fila">
          <span className="card-semaforo__icono-label">
            <CalendarioIcon className="card-semaforo__icono" aria-hidden="true" />
            Última operación
          </span>
          <span className="card-semaforo__valor">{ultimaOperacion}</span>
        </div>

        <div className="card-semaforo__fila">
          <span className="card-semaforo__icono-label">
            <PerfilIcon className="card-semaforo__icono" aria-hidden="true" />
            Cliente
          </span>
          <span className="card-semaforo__valor">{cliente ?? 'Sin asignar'}</span>
        </div>
      </div>

      {estado !== 'inactivo' && (
        <div className="card-semaforo__tarifa">
          <span className="card-semaforo__icono-label">
            <TarifasIcon className="card-semaforo__icono" aria-hidden="true" />
            Tarifa
          </span>
          <span className="card-semaforo__tarifa-precio">
            {tarifaAcumulada !== undefined ? `${tarifaAcumulada.toFixed(2)} €` : '0.00 €'}
          </span>
        </div>
      )}
    </div>
  )
}

export default CardSemaforo
