import Input          from '../atomos/Input'
import InputContrasenia from '../atomos/InputContrasenia'
import RequisitosContrasenia from './RequisitosContrasenia'

/** Campos de nombre, correo y contraseña (con confirmación) del registro de cuenta nueva. */
function EntradaDatosRegistro({
  nombre = '',       onNombreCambio,
  correo = '',       onCorreoCambio,
  contrasenia = '',  onContraseniaCambio,
  confirmacion = '', onConfirmacionCambio,
  errorNombre, errorCorreo, errorContrasenia, errorConfirmacion,
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
        autoComplete="name"
      />
      <Input
        id="registro-correo"
        label="Introduce tu correo:"
        type="email"
        placeholder="Introduce tu correo"
        value={correo}
        onChange={onCorreoCambio}
        error={errorCorreo}
        autoComplete="email"
      />
      <InputContrasenia
        id="registro-contrasenia"
        label="Introduce tu contraseña:"
        value={contrasenia}
        onChange={onContraseniaCambio}
        error={errorContrasenia}
      />
      <RequisitosContrasenia valor={contrasenia} />
      <InputContrasenia
        id="registro-confirmacion"
        label="Repite la contraseña:"
        placeholder="Introduce tu contraseña nuevamente"
        value={confirmacion}
        onChange={onConfirmacionCambio}
        error={errorConfirmacion}
      />
    </div>
  )
}

export default EntradaDatosRegistro
