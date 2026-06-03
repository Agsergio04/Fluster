/**
 * Campo de formulario genérico con label, mensaje de error y hint.
 * El error toma precedencia sobre el hint: si ambos están presentes,
 * solo se muestra el error para no sobrecargar la UI con texto.
 * El modificador `input--error` en el label aplica el borde rojo a todo el bloque.
 */
function Input({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  hint,
  name,
  autoComplete,
  variant,
  size,
}) {
  const clases = [
    'input',
    error   && 'input--error',
    variant && `input--${variant}`,
    size    && `input--${size}`,
  ].filter(Boolean).join(' ')

  return (
    <label className={clases} htmlFor={id}>

      {label && (
        <span className="input__label">
          {label}
          {required && <abbr title="required">*</abbr>}
        </span>
      )}

      {error && (
        <span className="input__error" id={`${id}-error`}>{error}</span>
      )}

      <input
        className="input__field"
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        name={name}
        autoComplete={autoComplete}
        // Vincula el mensaje de error con el campo para los lectores de pantalla
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : (hint ? `${id}-hint` : undefined)}
      />

      {hint && !error && (
        <span className="input__hint" id={`${id}-hint`}>{hint}</span>
      )}

    </label>
  )
}

export default Input
