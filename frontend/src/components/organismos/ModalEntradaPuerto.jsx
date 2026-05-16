import { useState } from 'react'

function ModalEntradaPuerto({ onConfirmar, onCancelar }) {
  const [nombre, setNombre] = useState('')

  const handleKeyDown = e => {
    if (e.key === 'Enter' && nombre.trim()) onConfirmar(nombre.trim())
    if (e.key === 'Escape') onCancelar()
  }

  return (
    <div className="modal-editar-contenedor" onClick={onCancelar}>
      <div
        className="modal-editar-contenedor__panel"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="modal-entrada-puerto__titulo">Entrada a Puerto</h2>

        <div className="modal-editar-contenedor__campo">
          <label className="modal-editar-contenedor__label">
            Nombre del cliente
          </label>
          <input
            className="modal-editar-contenedor__fecha-input"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Introduce el nombre del cliente"
            autoFocus
          />
        </div>

        <div className="modal-editar-contenedor__botones">
          <button
            className="modal-editar-contenedor__btn-cancelar"
            type="button"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            className="modal-editar-contenedor__btn-actualizar"
            type="button"
            disabled={!nombre.trim()}
            onClick={() => onConfirmar(nombre.trim())}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalEntradaPuerto
