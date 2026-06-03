/** Botón de acción principal del panel de generación de informes PDF. */
function BotonGenerarInforme({ disabled = false, onClick }) {
  return (
    <button
      className="btn-generar-informe"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      Generar informe
    </button>
  )
}

export default BotonGenerarInforme
