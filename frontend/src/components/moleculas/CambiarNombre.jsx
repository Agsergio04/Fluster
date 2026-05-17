import Input from '../atomos/Input'
import BotonRegistroLogin from '../atomos/BotonRegistroLogin'

function CambiarNombre({
  nombre = '',        onNombreCambio,
  errorNombre,
  onConfirmar,        disabled = false,
}) {
  return (
    <div className="cambiar-nombre">
      <Input
        id="cambiar-nombre-input"
        label="Introduce tu nuevo nombre:"
        placeholder="Introduce tu nombre"
        value={nombre}
        onChange={onNombreCambio}
        error={errorNombre}
      />
      <BotonRegistroLogin onClick={onConfirmar} disabled={disabled}>
        Cambiar el nombre
      </BotonRegistroLogin>
    </div>
  )
}

export default CambiarNombre
