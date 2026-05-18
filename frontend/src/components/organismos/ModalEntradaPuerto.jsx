import { useState } from 'react'

function ModalEntradaPuerto({ onConfirmar, onCancelar }) {
  const [nombre, setNombre] = useState('')

  const handleKeyDown = e => {
    if (e.key === 'Enter' && nombre.trim()) onConfirmar(nombre.trim())
    if (e.key === 'Escape') onCancelar()
  }

  return (
    <div className="modal-entrada-puerto" onClick={onCancelar}>
      <div
        className="modal-entrada-puerto__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entrada-puerto-titulo"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="entrada-puerto-titulo" className="modal-entrada-puerto__titulo">
          Entrada a Puerto
        </h2>

        <div className="modal-entrada-puerto__campo">
          <label htmlFor="entrada-puerto-cliente" className="modal-entrada-puerto__label">
            Nombre del cliente
          </label>
          <input
            id="entrada-puerto-cliente"
            className="modal-entrada-puerto__input"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Introduce el nombre del cliente"
            autoFocus
          />
        </div>

        <div className="modal-entrada-puerto__botones">
          <button
            type="button"
            className="modal-entrada-puerto__btn-cancelar"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="modal-entrada-puerto__btn-confirmar"
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
