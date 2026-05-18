/** Campo de formulario genérico con label y entrada de texto. */
function TextoConEntradaDatos({ id, label, placeholder, value, onChange, type = 'text' }) {
  return (
    <div className="texto-con-entrada-datos">
      <label className="texto-con-entrada-datos__label" htmlFor={id}>
        {label}
      </label>
      <input
        className="texto-con-entrada-datos__input"
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}

      />
    </div>
  )
}

export default TextoConEntradaDatos
