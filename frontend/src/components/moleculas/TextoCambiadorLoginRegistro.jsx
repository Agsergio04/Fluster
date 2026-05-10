function TextoCambiadorLoginRegistro({ texto, labelBoton, onClick }) {
  return (
    <div className="texto-cambiador-login-registro">
      <p className="texto-cambiador-login-registro__pregunta">{texto}</p>
      <button
        className="texto-cambiador-login-registro__boton"
        type="button"
        onClick={onClick}
      >
        {labelBoton}
      </button>
    </div>
  )
}

export default TextoCambiadorLoginRegistro
