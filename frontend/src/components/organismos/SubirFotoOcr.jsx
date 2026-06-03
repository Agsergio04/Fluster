import BotonSeleccionarFoto from '../atomos/BotonSeleccionarFoto'
import IntroducirFotoIcon from '../../assets/icons/Icono Introducr mediante foto.svg?react'

/**
 * Componente de entrada de contenedor con tres modos visuales:
 * - 'subiendo': pantalla inicial — el usuario elige foto o cambia a entrada manual
 * - 'introducido': foto cargada, muestra previsualización y el campo BIC (rellenado por OCR)
 * - 'manual': formulario solo con el campo BIC sin foto
 *
 * El estado activo lo controla la página padre (meter_contenedor) para mantener
 * la lógica de transición separada de la presentación.
 */
function SubirFotoOcr({
  estado = 'subiendo',
  onSeleccionarFoto,
  onIntroducirManual,
  foto,
  codigoBic = '',
  errorOcr = '',
  onCodigoBicCambio,
  cargandoOcr = false,
  onIntroducir,
  onCancelar,
}) {
  // Estado: imagen cargada + OCR ejecutado
  if (estado === 'introducido') {
    return (
      <div className="subir-foto-ocr subir-foto-ocr--introducido">
        <div className="subir-foto-ocr__previsualizacion">
          <h2 className="subir-foto-ocr__previsualizacion-titulo">Previsualizado de la imagen</h2>
          <img
            className="subir-foto-ocr__foto"
            src={foto}
            alt="Previsualizado del contenedor"
            width="400"
            height="300"
            decoding="async"
          />
        </div>

        <div className="subir-foto-ocr__formulario">
          <div className="subir-foto-ocr__campo-bic">
            <label htmlFor="bic-ocr" className="subir-foto-ocr__bic-label">
              Código BIC
            </label>
            <input
              id="bic-ocr"
              className="subir-foto-ocr__bic-input"
              type="text"
              value={codigoBic}
              onChange={onCodigoBicCambio}
              // El placeholder indica si el OCR sigue procesando
              placeholder={cargandoOcr ? 'Detectando...' : 'BLKU258036'}
              disabled={cargandoOcr}
            />
            {errorOcr && (
              <p className="subir-foto-ocr__error-ocr" role="alert">{errorOcr}</p>
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

  // Estado: entrada manual sin foto
  if (estado === 'manual') {
    return (
      <div className="subir-foto-ocr subir-foto-ocr--introducido">
        <div className="subir-foto-ocr__formulario subir-foto-ocr__formulario--solo">
          <div className="subir-foto-ocr__campo-bic">
            <label htmlFor="bic-manual" className="subir-foto-ocr__bic-label">
              Código BIC
            </label>
            <input
              id="bic-manual"
              className="subir-foto-ocr__bic-input"
              type="text"
              value={codigoBic}
              onChange={onCodigoBicCambio}
              placeholder="BLKU258036"
              autoFocus
            />
          </div>

          <div className="subir-foto-ocr__botones-accion">
            <button
              type="button"
              className="subir-foto-ocr__btn-introducir"
              onClick={onIntroducir}
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

  // Estado: pantalla inicial — elegir foto o entrada manual
  return (
    <div className="subir-foto-ocr">
      <div className="subir-foto-ocr__cuerpo">
        <IntroducirFotoIcon className="subir-foto-ocr__icono" aria-hidden="true" />

        <div className="subir-foto-ocr__info">
          <div className="subir-foto-ocr__texto">
            <h2 className="subir-foto-ocr__titulo">Introduce la imagen</h2>
            <p className="subir-foto-ocr__descripcion">
              Aquí puedes arrastrar la imagen o meterla directamente para la inclusión del contenedor
            </p>
          </div>
          <div className="subir-foto-ocr__botones-inicio">
            <BotonSeleccionarFoto onClick={onSeleccionarFoto} />
            <button
              type="button"
              className="subir-foto-ocr__btn-manual"
              onClick={onIntroducirManual}
            >
              Introducir manualmente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubirFotoOcr
