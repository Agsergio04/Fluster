import CabeceraSemaforoCard from '../moleculas/CabeceraSemaforoCard'
import BotonEditadoFechaContenedor from '../atomos/BotonEditadoFechaContenedor'
import CalendarioIcon from '../../assets/icons/Icono calendario.svg?react'
import PerfilIcon from '../../assets/icons/Icono Perfil.svg?react'
import TarifasIcon from '../../assets/icons/Icono Tarifas.svg?react'

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
  onEditarFecha,
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
          <p className="card-semaforo__etiqueta">Código Bic :</p>
          <p className="card-semaforo__valor">{codigoBic}</p>
        </div>

        <div className="card-semaforo__datos">
          <div className="card-semaforo__fila-fecha">
            <div className="card-semaforo__fecha-izq">
              <div className="card-semaforo__icono-label">
                <CalendarioIcon className="card-semaforo__icono" aria-hidden="true" />
                <p className="card-semaforo__etiqueta-sm">Ultima operacion :</p>
              </div>
              <p className="card-semaforo__valor-sm">{ultimaOperacion}</p>
            </div>
            <BotonEditadoFechaContenedor onClick={onEditarFecha} />
          </div>

          <div className="card-semaforo__fila-cliente">
            <div className="card-semaforo__icono-label">
              <PerfilIcon className="card-semaforo__icono" aria-hidden="true" />
              <p className="card-semaforo__etiqueta-sm">Cliente :</p>
            </div>
            <p className="card-semaforo__valor-sm">{cliente ?? 'Sin Asignar'}</p>
          </div>
        </div>
      </div>

      {estado !== 'inactivo' && (
        <div className="card-semaforo__tarifa">
          <div className="card-semaforo__tarifa-titulo">
            <TarifasIcon className="card-semaforo__icono" aria-hidden="true" />
            <p className="card-semaforo__etiqueta-lg">Tarifa acumulada</p>
          </div>
          <p className="card-semaforo__tarifa-precio">
            {tarifaAcumulada !== undefined ? `${tarifaAcumulada.toFixed(2)} €` : '0.00 €'}
          </p>
        </div>
      )}
    </div>
  )
}

export default CardSemaforo
