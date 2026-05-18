import { useState } from 'react'

/**
 * Modal para corregir la fecha de inicio libre de un contenedor.
 * La fecha se inicializa con el valor actual para que el usuario
 * solo tenga que modificar lo que quiera cambiar.
 * El clic fuera del panel cancela sin guardar.
 *
 * @param {string}   fechaActual - Fecha en formato ISO o compatible con Date()
 * @param {function} onConfirmar - Recibe la nueva fecha en formato 'YYYY-MM-DD'
 * @param {function} onCancelar
 */
function ModalEditarFecha({ fechaActual, onConfirmar, onCancelar }) {
  const [fecha, setFecha] = useState(
    fechaActual ? new Date(fechaActual).toISOString().split('T')[0] : ''
  )

  const handleKeyDown = e => {
    if (e.key === 'Enter' && fecha) onConfirmar(fecha)
    if (e.key === 'Escape') onCancelar()
  }

  return (
    <div className="modal-editar-contenedor" onClick={onCancelar}>
      <div
        className="modal-editar-contenedor__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-fecha-titulo"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="editar-fecha-titulo" className="modal-editar-contenedor__titulo">
          Editar fecha de operación
        </h2>

        <div className="modal-editar-contenedor__campo">
          <label htmlFor="editar-fecha-input" className="modal-editar-contenedor__label">
            Fecha de inicio libre
          </label>
          <input
            id="editar-fecha-input"
            type="date"
            className="modal-editar-contenedor__fecha-input"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <div className="modal-editar-contenedor__botones">
          <button
            type="button"
            className="modal-editar-contenedor__btn-cancelar"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="modal-editar-contenedor__btn-actualizar"
            disabled={!fecha}
            onClick={() => onConfirmar(fecha)}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalEditarFecha
