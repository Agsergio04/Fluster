import InputContrasenia from '../atomos/InputContrasenia'
import RequisitosContrasenia from './RequisitosContrasenia'
import BotonRegistroLogin from '../atomos/BotonRegistroLogin'

/**
 * Formulario de cambio de contraseña con tres campos: actual, nueva y confirmación.
 * La validación de coincidencia se hace en el padre (página Perfil) antes de
 * llamar a la API, para dar feedback inmediato sin una petición extra.
 */
function CambiarContrasenia({
  contraseniaActual = '',  onContraseniaActualCambio,
  contrasenia = '',        onContraseniaCambio,
  confirmacion = '',       onConfirmacionCambio,
  errorContraseniaActual,  errorContrasenia,    errorConfirmacion,
  onConfirmar,             disabled = false,
}) {
  return (
    <div className="cambiar-contrasenia">
      <InputContrasenia
        id="cambiar-contrasenia-actual"
        label="Introduce tu contraseña actual:"
        placeholder="Introduce tu contraseña actual"
        value={contraseniaActual}
        onChange={onContraseniaActualCambio}
        error={errorContraseniaActual}
        disabled={disabled}
        autoComplete="current-password"
      />
      <InputContrasenia
        id="cambiar-contrasenia-nueva"
        label="Introduce tu nueva contraseña:"
        placeholder="Introduce la nueva contraseña"
        value={contrasenia}
        onChange={onContraseniaCambio}
        error={errorContrasenia}
        disabled={disabled}
        autoComplete="new-password"
      />
      <RequisitosContrasenia valor={contrasenia} />
      <InputContrasenia
        id="cambiar-contrasenia-confirmar"
        label="Repite la contraseña:"
        placeholder="Introduce tu contraseña nuevamente"
        value={confirmacion}
        onChange={onConfirmacionCambio}
        error={errorConfirmacion}
        disabled={disabled}
        autoComplete="new-password"
      />
      <BotonRegistroLogin onClick={onConfirmar} disabled={disabled}>
        Cambiar la contraseña
      </BotonRegistroLogin>
    </div>
  )
}

export default CambiarContrasenia
