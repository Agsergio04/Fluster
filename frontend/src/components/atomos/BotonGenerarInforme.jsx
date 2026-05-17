function BotonGenerarInforme({ disabled = false, onClick }) {
  return (
    <button
      className="btn-generar-informe"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      Generar Informe
    </button>
  )
}

export default BotonGenerarInforme
