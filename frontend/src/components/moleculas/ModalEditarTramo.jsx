import { useState } from 'react'

function ModalEditarTramo({ tramo, fechaInicio, fechaFin, onGuardar, onCancelar }) {
  const toInputDate = (fecha) =>
    fecha ? new Date(fecha).toISOString().split('T')[0] : ''

  const [inicio,   setInicio]   = useState(toInputDate(fechaInicio))
  const [fin,      setFin]      = useState(toInputDate(fechaFin))
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState('')

  const handleGuardar = async () => {
    setError('')
    setCargando(true)
    try {
      await onGuardar({
        fechaInicio: inicio ? new Date(inicio).toISOString() : undefined,
        fechaFin:    fin    ? new Date(fin).toISOString()    : undefined,
      })
    } catch (err) {
      setError(err.response?.data?.mensaje ?? 'Error al guardar los cambios')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="modal-editar-contenedor" onClick={onCancelar}>
      <div
        className="modal-editar-contenedor__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-tramo-titulo"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="editar-tramo-titulo" className="modal-editar-contenedor__titulo">
          Editar {tramo}
        </h2>

        <div className="modal-editar-contenedor__campo">
          <label htmlFor="editar-tramo-inicio" className="modal-editar-contenedor__label">
            Fecha de inicio
          </label>
          <input
            id="editar-tramo-inicio"
            type="date"
            className="modal-editar-contenedor__fecha-input"
            value={inicio}
            onChange={e => setInicio(e.target.value)}
          />
        </div>

        <div className="modal-editar-contenedor__campo">
          <label htmlFor="editar-tramo-fin" className="modal-editar-contenedor__label">
            Fecha de fin
          </label>
          <input
            id="editar-tramo-fin"
            type="date"
            className="modal-editar-contenedor__fecha-input"
            value={fin}
            onChange={e => setFin(e.target.value)}
          />
        </div>

        {error && <p className="modal-editar-contenedor__error">{error}</p>}

        <div className="modal-editar-contenedor__botones">
          <button
            type="button"
            className="modal-editar-contenedor__btn-actualizar"
            onClick={handleGuardar}
            disabled={cargando}
          >
            {cargando ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            className="modal-editar-contenedor__btn-cancelar"
            onClick={onCancelar}
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  )
}

export default ModalEditarTramo
