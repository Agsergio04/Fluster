import InputContrasenia from '../atomos/InputContrasenia'
import BotonRegistroLogin from '../atomos/BotonRegistroLogin'

function CambiarContrasenia({
  contrasenia = '',    onContraseniaCambio,
  confirmacion = '',   onConfirmacionCambio,
  errorContrasenia,    errorConfirmacion,
  onConfirmar,         disabled = false,
}) {
  return (
    <div className="cambiar-contrasenia">
      <InputContrasenia
        id="cambiar-contrasenia-nueva"
        label="Introduce tu nueva contraseña:"
        placeholder="Introduce la nueva contraseña"
        value={contrasenia}
        onChange={onContraseniaCambio}
        error={errorContrasenia}
      />
      <InputContrasenia
        id="cambiar-contrasenia-confirmar"
        label="Repite la contraseña:"
        placeholder="Introduce tu contraseña nuevamente"
        value={confirmacion}
        onChange={onConfirmacionCambio}
        error={errorConfirmacion}
      />
      <BotonRegistroLogin onClick={onConfirmar} disabled={disabled}>
        Cambiar la contraseña
      </BotonRegistroLogin>
    </div>
  )
}

export default CambiarContrasenia
