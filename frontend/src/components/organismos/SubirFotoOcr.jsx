import BotonSeleccionarFoto from '../atomos/BotonSeleccionarFoto'
import IntroducirFotoIcon from '../../assets/icons/Icono Introducr mediante foto.svg?react'

function SubirFotoOcr({
  estado = 'subiendo',
  onSeleccionarFoto,
  foto,
  codigoBic = '',
  errorOcr = '',
  onCodigoBicCambio,
  cargandoOcr = false,
  onIntroducir,
  onCancelar,
}) {
  if (estado === 'introducido') {
    return (
      <div className="subir-foto-ocr subir-foto-ocr--introducido">
        <div className="subir-foto-ocr__previsualizacion">
          <p className="subir-foto-ocr__previsualizacion-titulo">Previsualizado de la imagen</p>
          <img className="subir-foto-ocr__foto" src={foto} alt="Previsualizado del contenedor" />
        </div>

        <div className="subir-foto-ocr__formulario">
          <div className="subir-foto-ocr__campo-bic">
            <p className="subir-foto-ocr__bic-label">Codigo BIC</p>
            <input
              className="subir-foto-ocr__bic-input"
              type="text"
              value={codigoBic}
              onChange={onCodigoBicCambio}
              placeholder={cargandoOcr ? 'Detectando...' : 'BLKU258036'}
              disabled={cargandoOcr}
            />
            {errorOcr && (
              <p className="subir-foto-ocr__error-ocr">{errorOcr}</p>
            )}
          </div>

          <div className="subir-foto-ocr__botones-accion">
            <button
              type="button"
              className="subir-foto-ocr__btn-introducir"
              onClick={onIntroducir}
              disabled={cargandoOcr}
            >
              Introducir contenedor
            </button>
            <button
              type="button"
              className="subir-foto-ocr__btn-cancelar"
              onClick={onCancelar}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="subir-foto-ocr">
      <div className="subir-foto-ocr__cuerpo">
        <IntroducirFotoIcon className="subir-foto-ocr__icono" aria-hidden="true" />

        <div className="subir-foto-ocr__info">
          <div className="subir-foto-ocr__texto">
            <p className="subir-foto-ocr__titulo">Introduce la Imagen</p>
            <p className="subir-foto-ocr__descripcion">
              Aqui puedes arrastrar la imagen o meterla directamente para la inclusion del contenedor
            </p>
          </div>
          <BotonSeleccionarFoto onClick={onSeleccionarFoto} />
        </div>
      </div>
    </div>
  )
}

export default SubirFotoOcr
