import CalendarioIcon from '../../assets/icons/Icono calendario.svg?react'
import PerfilIcon from '../../assets/icons/Icono Perfil.svg?react'
import BotonCardAlmacen from '../atomos/BotonCardAlmacen'

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
        <p className="card-almacen__etiqueta">Código Bic :</p>
        <p className="card-almacen__valor">{codigoBic}</p>
      </div>

      <div className="card-almacen__fila-fecha">
        <div className="card-almacen__fecha-izq">
          <div className="card-almacen__icono-label">
            <CalendarioIcon className="card-almacen__icono" aria-hidden="true" />
            <p className="card-almacen__etiqueta-sm">Ultima operacion :</p>
          </div>
          <p className="card-almacen__valor-sm">{ultimaOperacion}</p>
        </div>
      </div>

      <div className="card-almacen__fila-fecha">
        <div className="card-almacen__fecha-izq">
          <div className="card-almacen__icono-label">
            <CalendarioIcon className="card-almacen__icono" aria-hidden="true" />
            <p className="card-almacen__etiqueta-sm">Fecha de Inclusión :</p>
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
