/**
 * Botón icónico sin texto visible; el label se expone solo mediante aria-label.
 * Se usa para acciones binarias donde el contexto visual hace el texto redundante.
 */
function BotonDecision({ label, selected = false, disabled = false, onClick }) {
  return (
    <button
      className={`btn-decision${selected ? ' btn-decision--selected' : ''}`}
      type="button"
      aria-label={label}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    />
  )
}

export default BotonDecision
