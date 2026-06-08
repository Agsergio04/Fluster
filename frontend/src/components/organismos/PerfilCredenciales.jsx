import { useRef, memo } from 'react'
import CambiarNombre from '../moleculas/CambiarNombre'
import CambiarContrasenia from '../moleculas/CambiarContrasenia'
import BotonAccionTarifa from '../atomos/BotonAccionTarifa'
import BotonOperacionesPerfil from '../atomos/BotonOperacionesPerfil'
import imagenUsuarioDefault from '../../assets/images/imagen-usuario.png'

/**
 * Panel de perfil de usuario con foto, datos de sesión y formularios de cambio
 * de nombre y contraseña. La foto se lee como data URL mediante FileReader
 * y se envía directamente al padre sin pasar por un estado propio,
 * ya que la lógica de subida reside en la página Perfil.
 *
 * El input file está oculto y se dispara desde el botón visible para
 * aplicar estilos custom sin restricciones del aspecto nativo del input.
 */
function PerfilCredenciales({
  foto,
  nombre,
  rol,
  correo,
  onActualizarFoto,
  errorFoto,
  nuevoNombre,
  onNuevoNombreCambio,
  errorNombre,
  onConfirmarNombre,
  disabledNombre,
  contraseniaActual,
  onContraseniaActualCambio,
  errorContraseniaActual,
  contrasenia,
  onContraseniaCambio,
  confirmacion,
  onConfirmacionCambio,
  errorContrasenia,
  errorConfirmacion,
  onConfirmarContrasenia,
  disabledContrasenia,
  onCerrarSesion,
}) {
  const inputFotoRef = useRef(null)

  const handleSeleccionarFoto = e => {
    const fichero = e.target.files?.[0]
    if (!fichero) return
    const reader = new FileReader()
    reader.onload = () => onActualizarFoto(reader.result)
    reader.readAsDataURL(fichero)
    // Limpiar el valor para que pueda re-seleccionarse el mismo fichero
    e.target.value = ''
  }

  return (
    <div className="perfil-credenciales">
      <div className="perfil-credenciales__info">
        <div className="perfil-credenciales__foto-seccion">
          <img
            src={foto || imagenUsuarioDefault}
            alt={nombre || 'Foto de perfil'}
            className="perfil-credenciales__foto"
            width="220"
            height="212"
            decoding="async"
          />
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            aria-hidden="true"
            style={{ display: 'none' }}
            onChange={handleSeleccionarFoto}
          />
          <BotonAccionTarifa accion="actualizar" onClick={() => inputFotoRef.current?.click()} />
          {errorFoto && (
            <p className="perfil-credenciales__error-foto" role="alert">{errorFoto}</p>
          )}
          <div className="perfil-credenciales__campo">
            <h3 className="perfil-credenciales__etiqueta">Nombre</h3>
            <p className="perfil-credenciales__valor">{nombre}</p>
          </div>
        </div>
        <div className="perfil-credenciales__campo">
          <h3 className="perfil-credenciales__etiqueta">Rol</h3>
          <p className="perfil-credenciales__valor">{rol}</p>
        </div>
        <div className="perfil-credenciales__campo">
          <h3 className="perfil-credenciales__etiqueta">Correo</h3>
          <p className="perfil-credenciales__valor">{correo}</p>
        </div>
      </div>

      <div className="perfil-credenciales__cambios">
        <h2 className="perfil-credenciales__titulo">Cambio de credenciales</h2>
        <CambiarNombre
          nombre={nuevoNombre}
          onNombreCambio={onNuevoNombreCambio}
          errorNombre={errorNombre}
          onConfirmar={onConfirmarNombre}
          disabled={disabledNombre}
        />
        <CambiarContrasenia
          contraseniaActual={contraseniaActual}
          onContraseniaActualCambio={onContraseniaActualCambio}
          errorContraseniaActual={errorContraseniaActual}
          contrasenia={contrasenia}
          onContraseniaCambio={onContraseniaCambio}
          confirmacion={confirmacion}
          onConfirmacionCambio={onConfirmacionCambio}
          errorContrasenia={errorContrasenia}
          errorConfirmacion={errorConfirmacion}
          onConfirmar={onConfirmarContrasenia}
          disabled={disabledContrasenia}
        />
        <BotonOperacionesPerfil variante="cerrar-sesion" onClick={onCerrarSesion} />
      </div>
    </div>
  )
}

export default memo(PerfilCredenciales)
