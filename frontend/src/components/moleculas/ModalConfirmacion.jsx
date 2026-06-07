import { useEffect, useRef } from 'react'

/**
 * Diálogo modal de confirmación para acciones destructivas (como borrar un
 * contenedor). Oscurece el fondo, bloquea su interacción y exige una
 * confirmación explícita: la acción solo se ejecuta al pulsar el botón de
 * confirmar, de modo que un clic accidental en "borrar" ya no elimina nada.
 *
 * Accesible: role="alertdialog" + aria-modal, foco inicial en "Cancelar"
 * (la opción segura) y cierre con la tecla Escape o pulsando fuera del panel.
 *
 * @param {string}   titulo                      - Título del diálogo
 * @param {string}   mensaje                     - Texto que explica la consecuencia
 * @param {string}   [textoConfirmar='Borrar']   - Etiqueta del botón de acción
 * @param {string}   [textoCancelar='Cancelar']  - Etiqueta del botón seguro
 * @param {string}   [textoCargando='Borrando…'] - Etiqueta mientras se procesa
 * @param {boolean}  [cargando=false]            - Deshabilita los botones durante la acción
 * @param {function} onConfirmar
 * @param {function} onCancelar
 */
function ModalConfirmacion({
  titulo,
  mensaje,
  textoConfirmar = 'Borrar',
  textoCancelar  = 'Cancelar',
  textoCargando  = 'Borrando…',
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  const cancelarRef = useRef(null)

  // Foco inicial en la opción segura ("Cancelar") al abrir el diálogo
  useEffect(() => { cancelarRef.current?.focus() }, [])

  // Cierre con la tecla Escape
  useEffect(() => {
    const alPulsarTecla = e => { if (e.key === 'Escape') onCancelar?.() }
    document.addEventListener('keydown', alPulsarTecla)
    return () => document.removeEventListener('keydown', alPulsarTecla)
  }, [onCancelar])

  return (
    <div className="modal-confirmacion" onClick={onCancelar}>
      <div
        className="modal-confirmacion__panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-confirmacion-titulo"
        aria-describedby={mensaje ? 'modal-confirmacion-mensaje' : undefined}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="modal-confirmacion__titulo" id="modal-confirmacion-titulo">{titulo}</h2>
        {mensaje && (
          <p className="modal-confirmacion__mensaje" id="modal-confirmacion-mensaje">{mensaje}</p>
        )}
        <div className="modal-confirmacion__botones">
          <button
            ref={cancelarRef}
            type="button"
            className="modal-confirmacion__btn-cancelar"
            onClick={onCancelar}
            disabled={cargando}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className="modal-confirmacion__btn-confirmar"
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? textoCargando : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalConfirmacion
