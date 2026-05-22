import { useState, useEffect } from 'react'
import placeholder from '../../assets/images/PlaceHolder-contenedor.jpg'
import BotonEditar from '../atomos/BotonEditar'
import BotonEliminar from '../atomos/BotonEliminar'

function CardContenedor({ foto, codigoBic, fechaInclusion, onEditar, onEliminar }) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => { setImgError(false) }, [foto])

  const usarPlaceholder = !foto || imgError
  const imgSrc = usarPlaceholder ? placeholder : foto
  // Alt vacío cuando es el placeholder: es decorativo, el BIC ya está en el texto
  const imgAlt = usarPlaceholder ? '' : `Foto del contenedor ${codigoBic}`

  return (
    <div className="card-contenedor">
      <div className="card-contenedor__foto-wrapper">
        <img
          className="card-contenedor__foto"
          src={imgSrc}
          alt={imgAlt}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
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
