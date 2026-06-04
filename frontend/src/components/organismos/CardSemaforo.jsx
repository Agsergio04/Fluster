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

      <div className="card-semaforo__cuerpo">
        <div className="card-semaforo__bic">
          <span className="card-semaforo__etiqueta">Código BIC :</span>
          <span className="card-semaforo__valor">{codigoBic}</span>
        </div>

        <div className="card-semaforo__datos">
          <div className="card-semaforo__fila-fecha">
            <div className="card-semaforo__icono-label">
              <CalendarioIcon className="card-semaforo__icono" aria-hidden="true" />
              <p className="card-semaforo__etiqueta-sm">Última operación :</p>
            </div>
            <p className="card-semaforo__valor-sm">{ultimaOperacion}</p>
          </div>

          <div className="card-semaforo__fila-cliente">
            <div className="card-semaforo__icono-label">
              <PerfilIcon className="card-semaforo__icono" aria-hidden="true" />
              <p className="card-semaforo__etiqueta-sm">Cliente :</p>
            </div>
            <p className="card-semaforo__valor-sm">{cliente ?? 'Sin asignar'}</p>
          </div>
        </div>
      </div>

      {estado !== 'inactivo' && (
        <div className="card-semaforo__tarifa">
          <div className="card-semaforo__tarifa-titulo">
            <TarifasIcon className="card-semaforo__icono" aria-hidden="true" />
            <span className="card-semaforo__etiqueta-lg">Tarifa acumulada</span>
          </div>
          <span className="card-semaforo__tarifa-precio">
            {tarifaAcumulada !== undefined ? `${tarifaAcumulada.toFixed(2)} €` : '0.00 €'}
          </span>
        </div>
      )}
    </div>
  )
}

export default CardSemaforo
