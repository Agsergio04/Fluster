import { useRef } from 'react'
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
            alt={nombre}
            className="perfil-credenciales__foto"
            loading="lazy"
            decoding="async"
          />
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleSeleccionarFoto}
          />
          <BotonAccionTarifa accion="actualizar" onClick={() => inputFotoRef.current?.click()} />
          <div className="perfil-credenciales__campo">
            <p className="perfil-credenciales__etiqueta">Nombre</p>
            <p className="perfil-credenciales__valor">{nombre}</p>
          </div>
        </div>
        <div className="perfil-credenciales__campo">
          <p className="perfil-credenciales__etiqueta">Rol</p>
          <p className="perfil-credenciales__valor">{rol}</p>
        </div>
        <div className="perfil-credenciales__campo">
          <p className="perfil-credenciales__etiqueta">Correo</p>
          <p className="perfil-credenciales__valor">{correo}</p>
        </div>
      </div>

      <div className="perfil-credenciales__cambios">
        <p className="perfil-credenciales__titulo">Cambio de credenciales</p>
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

export default PerfilCredenciales
