import Input          from '../atomos/Input'
import InputContrasenia from '../atomos/InputContrasenia'

/** Campos de correo y contraseña del formulario de inicio de sesión. */
function EntradaDatosLogin({
  correo = '',         onCorreoCambio,
  contrasenia = '',    onContraseniaCambio,
  errorCorreo,         errorContrasenia,
}) {
  return (
    <div className="entrada-datos-login">
      <Input
        id="login-correo"
        label="Introduce tu correo:"
        type="email"
        placeholder="Introduce tu correo"
        value={correo}
        onChange={onCorreoCambio}
        error={errorCorreo}
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
