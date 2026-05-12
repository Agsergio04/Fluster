import Input          from '../atomos/Input'
import InputContrasenia from '../atomos/InputContrasenia'

function EntradaDatosRegistro({
  nombre = '',      onNombreCambio,
  correo = '',      onCorreoCambio,
  contrasenia = '', onContraseniaCambio,
  errorNombre, errorCorreo, errorContrasenia,
}) {
  return (
    <div className="entrada-datos-registro">
      <Input
        id="registro-nombre"
        label="Introduce tu nombre:"
        type="text"
        placeholder="Introduce tu nombre"
        value={nombre}
        onChange={onNombreCambio}
        error={errorNombre}
      />
      <Input
        id="registro-correo"
        label="Introduce tu correo:"
        type="email"
        placeholder="Introduce tu correo"
        value={correo}
        onChange={onCorreoCambio}
        error={errorCorreo}
      />
      <InputContrasenia
        id="registro-contrasenia"
        label="Introduce tu contraseña:"
        value={contrasenia}
        onChange={onContraseniaCambio}
        error={errorContrasenia}
      />
    </div>
  )
}

export default EntradaDatosRegistro
