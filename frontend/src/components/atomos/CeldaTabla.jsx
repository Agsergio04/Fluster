import { useState, useRef, useEffect } from 'react'

/**
 * Celda de la tabla de tarifas con tres modos de comportamiento:
 * - Solo lectura (readonly): renderiza un input visualmente idéntico al span
 *   para que la columna de naviera tenga la misma altura que el resto.
 * - Editable: el campo se vacía al recibir foco para facilitar la entrada
 *   y se restaura al valor externo (label) si el usuario borra todo y sale.
 * - Estático (por defecto): renderiza un span sin interactividad.
 *
 * @param {string}   label     - Valor actual a mostrar (controlado externamente)
 * @param {'sm'|'md'|'naviera'} tamanio
 * @param {'heading'|'body'}    fuente
 * @param {boolean}  editable
 * @param {boolean}  readonly  - Input no editable; mantiene el aspecto de input sin funcionalidad
 * @param {function} onChange  - (nuevoValor: string) → void
 */
function CeldaTabla({ label, ariaLabel, tamanio = 'md', fuente = 'heading', editable = false, readonly = false, onChange }) {
  // displayValue gestiona el valor interno mientras el input está enfocado;
  // cuando no está enfocado se muestra siempre el label del padre
  const [displayValue, setDisplayValue] = useState(label)
  const [focused,      setFocused]      = useState(false)
  const inputRef = useRef(null)

  // Enfocar el input cuando la fila entra en modo edición para que el usuario
  // pueda escribir directamente sin necesidad de un clic adicional
  useEffect(() => {
    if (editable && !readonly) inputRef.current?.focus()
  }, [editable, readonly])

  const clases = `celda-tabla celda-tabla--${tamanio}${fuente === 'body' ? ' celda-tabla--body' : ''}`

  if (editable || readonly) {
    return (
      <div className={clases}>
        <input
          ref={inputRef}
          className="celda-tabla__input"
          aria-label={ariaLabel ?? label}
          // Fuera del foco muestra siempre el valor autoritativo del padre
          value={focused ? displayValue : label}
          readOnly={readonly}
          onFocus={() => {
            if (!readonly) {
              setFocused(true)
              // Limpiar al enfocar para que el usuario no tenga que borrar el valor previo
              setDisplayValue('')
            }
          }}
          onBlur={() => {
            setFocused(false)
            // Si el usuario borra todo y sale, restaurar el último valor confirmado
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
