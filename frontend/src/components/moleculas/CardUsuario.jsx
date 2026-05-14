import RolAsignado from '../atomos/RolAsignado'
import BotonRolesCardUsuario from '../atomos/BotonRolesCardUsuario'
import BotonBorrarUsuario from '../atomos/BotonBorrarUsuario'
import imagenUsuarioDefault from '../../assets/images/imagen-usuario.png'

const ROLES = ['admin', 'gestor', 'operador']

function CardUsuario({ foto, nombre, correo, rol = 'operador', onCambiarRol, onEliminar }) {
  return (
    <div className="card-usuario">
      <div className="card-usuario__info">
        <div className="card-usuario__foto">
          <img
            src={foto || imagenUsuarioDefault}
            alt={nombre}
            className="card-usuario__imagen"
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
                onClick={() => onCambiarRol?.(r)}
              />
            ))}
          </div>
        </div>
        <div className="card-usuario__borrar">
          <p className="card-usuario__etiqueta">Borrar usuario</p>
          <BotonBorrarUsuario onClick={onEliminar} />
        </div>
      </div>
    </div>
  )
}

export default CardUsuario
