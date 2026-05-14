function CeldaTabla({ label, tamanio = 'md', fuente = 'heading', editable = false, onChange }) {
  const clases = `celda-tabla celda-tabla--${tamanio}${fuente === 'body' ? ' celda-tabla--body' : ''}`
  return (
    <div className={clases}>
      {editable
        ? <input
            className="celda-tabla__input"
            value={label}
            onChange={e => onChange?.(e.target.value)}
          />
        : <span className="celda-tabla__texto">{label}</span>
      }
    </div>
  )
}

export default CeldaTabla
