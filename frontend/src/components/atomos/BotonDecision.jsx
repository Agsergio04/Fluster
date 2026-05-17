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
