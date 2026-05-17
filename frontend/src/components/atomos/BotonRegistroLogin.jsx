function BotonRegistroLogin({ children, onClick, disabled = false, type = 'button' }) {
  return (
    <button
      className="btn-registro-login"
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default BotonRegistroLogin
