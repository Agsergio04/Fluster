import BotonSeleccionarFoto from '../atomos/BotonSeleccionarFoto'
import IntroducirFotoIcon from '../../assets/icons/Icono Introducr mediante foto.svg?react'
import EditarIcon from '../../assets/icons/Icono editar.svg?react'

/**
 * Registro de contenedor en dos bloques (columnas) independientes:
 *  - «Escaneo Inteligente (OCR)»: al subir/arrastrar una foto se muestra la
 *    previsualización, el código BIC detectado por el OCR (editable) y las
 *    acciones de introducir o cancelar (descarta la foto).
 *  - «Entrada Manual»: el operador escribe el código BIC y lo introduce.
 * Cada bloque tiene su propio campo y su propio botón de introducir.
 */
function SubirFotoOcr({
  foto,
  onSeleccionarFoto,
  onSoltarFoto,
  codigoBicOcr = '',
  onCodigoBicOcrCambio,
  errorOcr = '',
  cargandoOcr = false,
  cargando = false,
  onIntroducirOcr,
  onCancelarOcr,
  codigoBicManual = '',
  onCodigoBicManualCambio,
  errorManual = '',
  onIntroducirManual,
}) {
  return (
    <div className="subir-foto-ocr">
      {/* ── Bloque: escaneo OCR ── */}
      <section className="subir-foto-ocr__columna">
        <h2 className="subir-foto-ocr__columna-titulo">
          <IntroducirFotoIcon className="subir-foto-ocr__columna-icono" aria-hidden="true" />
          Escaneo Inteligente (OCR)
        </h2>

        {foto ? (
          <>
            <div className="subir-foto-ocr__preview">
              <img
                className="subir-foto-ocr__foto"
                src={foto}
                alt="Previsualización del contenedor"
                width="400"
                height="300"
                decoding="async"
              />
              <BotonSeleccionarFoto onClick={onSeleccionarFoto} disabled={cargandoOcr} label="Cambiar foto" />
            </div>

            <div className="subir-foto-ocr__campo-bic">
              <label htmlFor="bic-ocr" className="subir-foto-ocr__bic-label">Código BIC obtenido</label>
              <input
                id="bic-ocr"
                className="subir-foto-ocr__bic-input"
                type="text"
                value={codigoBicOcr}
                onChange={onCodigoBicOcrCambio}
                placeholder={cargandoOcr ? 'Detectando…' : 'P.EJ. MSKU1234567'}
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
                onClick={onIntroducirOcr}
                disabled={cargandoOcr || cargando || !codigoBicOcr.trim()}
              >
                Introducir contenedor
              </button>
              <button
                type="button"
                className="subir-foto-ocr__btn-cancelar"
                onClick={onCancelarOcr}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              className="subir-foto-ocr__dropzone"
              onClick={onSeleccionarFoto}
              onDragOver={e => e.preventDefault()}
              onDrop={onSoltarFoto}
            >
              <span className="subir-foto-ocr__dropzone-circulo" aria-hidden="true">
                <IntroducirFotoIcon className="subir-foto-ocr__dropzone-icono" />
              </span>
              <span className="subir-foto-ocr__dropzone-texto">
                Suelta la foto del contenedor aquí o{' '}
                <span className="subir-foto-ocr__dropzone-enlace">selecciona un archivo</span>
              </span>
              <span className="subir-foto-ocr__dropzone-formatos">Formatos aceptados: JPG, PNG</span>
            </button>

            <div className="subir-foto-ocr__info">
              <h3 className="subir-foto-ocr__info-titulo">¿Cómo funciona?</h3>
              <p className="subir-foto-ocr__info-texto">
                El motor OCR identifica automáticamente el código BIC del contenedor a partir de
                la foto. Asegúrate de que el código sea claramente visible y sin obstrucciones.
              </p>
            </div>
          </>
        )}
      </section>

      {/* ── Bloque: entrada manual ── */}
      <section className="subir-foto-ocr__columna">
        <h2 className="subir-foto-ocr__columna-titulo">
          <EditarIcon className="subir-foto-ocr__columna-icono" aria-hidden="true" />
          Entrada Manual
        </h2>

        <div className="subir-foto-ocr__campo-bic">
          <label htmlFor="bic-manual" className="subir-foto-ocr__bic-label">Código BIC</label>
          <input
            id="bic-manual"
            className="subir-foto-ocr__bic-input"
            type="text"
            value={codigoBicManual}
            onChange={onCodigoBicManualCambio}
            placeholder="P.EJ. MSKU1234567"
          />
          {errorManual && (
            <p className="subir-foto-ocr__error-ocr" role="alert">{errorManual}</p>
          )}
        </div>

        <div className="subir-foto-ocr__botones-accion">
          <button
            type="button"
            className="subir-foto-ocr__btn-introducir"
            onClick={onIntroducirManual}
            disabled={cargando || !codigoBicManual.trim()}
          >
            Introducir contenedor
          </button>
        </div>
      </section>
    </div>
  )
}

export default SubirFotoOcr
