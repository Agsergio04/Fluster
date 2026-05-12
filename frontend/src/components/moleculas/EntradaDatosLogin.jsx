import Input          from '../atomos/Input'
import InputContrasenia from '../atomos/InputContrasenia'

function EntradaDatosLogin({
  nombre = '',         onNombreCambio,
  contrasenia = '',    onContraseniaCambio,
  errorNombre,         errorContrasenia,
}) {
  return (
    <div className="entrada-datos-login">
      <Input
        id="login-nombre"
        label="Introduce tu nombre:"
        type="text"
        placeholder="Introduce tu nombre"
        value={nombre}
        onChange={onNombreCambio}
        error={errorNombre}
      />
      <InputContrasenia
        id="login-contrasenia"
        label="Introduce tu contraseña:"
        value={contrasenia}
        onChange={onContraseniaCambio}
        error={errorContrasenia}
      />
    </div>
  )
}

export default EntradaDatosLogin
