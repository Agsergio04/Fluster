import { useState } from 'react'

function CeldaTabla({ label, tamanio = 'md', fuente = 'heading', editable = false, readonly = false, onChange }) {
  const [displayValue, setDisplayValue] = useState(label)
  const [focused,      setFocused]      = useState(false)

  const clases = `celda-tabla celda-tabla--${tamanio}${fuente === 'body' ? ' celda-tabla--body' : ''}`

  if (editable || readonly) {
    return (
      <div className={clases}>
        <input
          className="celda-tabla__input"
          value={focused ? displayValue : label}
          readOnly={readonly}
          onFocus={() => {
            if (!readonly) {
              setFocused(true)
              setDisplayValue('')
            }
          }}
          onBlur={() => {
            setFocused(false)
            if (displayValue === '') setDisplayValue(label)
          }}
          onChange={e => {
            setDisplayValue(e.target.value)
            onChange?.(e.target.value)
          }}
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
