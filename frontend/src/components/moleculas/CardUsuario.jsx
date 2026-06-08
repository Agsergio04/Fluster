import RolAsignado from '../atomos/RolAsignado'
import BotonRolesCardUsuario from '../atomos/BotonRolesCardUsuario'
import BotonBorrarUsuario from '../atomos/BotonBorrarUsuario'
import imagenUsuarioDefault from '../../assets/images/imagen-usuario.png'

// Los tres roles posibles se listan explícitamente para controlar el orden
// visual de los botones de cambio de rol
const ROLES = ['admin', 'gestor', 'operador']

/**
 * Tarjeta de usuario para el panel de control del administrador.
 * Permite ver los datos del usuario, cambiar su rol pulsando uno de los
 * tres botones de rol, y eliminar la cuenta de forma permanente.
 */
function CardUsuario({ foto, nombre, correo, rol = 'operador', esPropio = false, onCambiarRol, onEliminar }) {
  return (
    <div className="card-usuario">
      <div className="card-usuario__info">
        <div className="card-usuario__foto">
          <img
            src={foto || imagenUsuarioDefault}
            alt=""
            className="card-usuario__imagen"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="card-usuario__datos">
          <div className="card-usuario__campo">
            <p className="card-usuario__etiqueta">Nombre</p>
            <p className="card-usuario__valor">{nombre}</p>
          </div>
          <div className="card-usuario__campo">
            <p className="card-usuario__etiqueta">Correo</p>
            <p className="card-usuario__valor">{correo}</p>
          </div>
          <div className="card-usuario__campo">
            <p className="card-usuario__etiqueta">Rol</p>
            <RolAsignado rol={rol} />
          </div>
        </div>
      </div>
      <div className="card-usuario__acciones">
        <div className="card-usuario__cambio-rol">
          <p className="card-usuario__etiqueta">Selecciona su rol</p>
          <div className="card-usuario__botones-rol">
            {ROLES.map(r => (
              <BotonRolesCardUsuario
                key={r}
                rol={r}
                seleccionado={r === rol}
                // Los roles no asignados se muestran en estado "--off"
                // (disponibles para cambiar), como define el diseño.
                active={r === rol}
                // El rol ya asignado no dispara click (evita un PUT redundante)
                onClick={r === rol ? undefined : () => onCambiarRol?.(r)}
              />
            ))}
          </div>
        </div>
        <div className="card-usuario__borrar">
          <BotonBorrarUsuario onClick={onEliminar} disabled={esPropio} />
        </div>
      </div>
    </div>
  )
}

export default CardUsuario
