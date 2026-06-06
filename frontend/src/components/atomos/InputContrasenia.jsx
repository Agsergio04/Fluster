import { useState } from 'react'

// Iconos de ojo definidos como sub-componentes inline para mantener
// la dependencia de SVG dentro del mismo fichero sin imports adicionales
function EyeOpenIcon() {
  return (
    <svg width="16" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeClosedIcon() {
  return (
    <svg width="16" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

/**
 * Campo de contraseña con botón de mostrar/ocultar integrado.
 * autoComplete="current-password" ayuda a los gestores de contraseñas a
 * identificar el campo y rellenarlo correctamente.
 */
function InputContrasenia({
  id,
  label,
  placeholder = 'Introduce tu contraseña',
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  hint,
  name,
  size,
}) {
  const [visible, setVisible] = useState(false)

  const clases = [
    'input',
    error && 'input--error',
    size  && `input--${size}`,
  ].filter(Boolean).join(' ')

  return (
    <label className={clases} htmlFor={id}>

      {label && (
        <span className="input__label">
          {label}
          {required && <abbr title="required">*</abbr>}
        </span>
      )}

      {error && <span className="input__error">{error}</span>}

      <div className="input__password-wrapper">
        <input
          className="input__field"
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          name={name}
          autoComplete="current-password"
        />
        <button
          className="input__eye-btn"
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
        </button>
      </div>

      {hint && !error && <span className="input__hint">{hint}</span>}

    </label>
  )
}

export default InputContrasenia
