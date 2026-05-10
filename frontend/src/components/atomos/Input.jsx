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
        <span className="input__error">{error}</span>
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
      />

      {hint && !error && (
        <span className="input__hint">{hint}</span>
      )}

    </label>
  )
}

export default Input
