function CeldaTabla({ label, tamanio = 'md', fuente = 'heading', editable = false, readonly = false, onChange }) {
  const clases = `celda-tabla celda-tabla--${tamanio}${fuente === 'body' ? ' celda-tabla--body' : ''}`

  if (editable || readonly) {
    return (
      <div className={clases}>
        <input
          className="celda-tabla__input"
          value={label}
          readOnly={readonly}
          onChange={e => onChange?.(e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className={clases}>
      <span className="celda-tabla__texto">{label}</span>
    </div>
  )
}

export default CeldaTabla
