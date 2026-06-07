import Spinner                     from '../atomos/Spinner'
import BotonRegistroLogin          from '../atomos/BotonRegistroLogin'
import TextoCambiadorLoginRegistro from './TextoCambiadorLoginRegistro'

/**
 * Agrupa el botón principal de login y el enlace de cambio a registro.
 * Cuando cargando es true el botón queda deshabilitado y muestra un spinner
 * en lugar del texto para dar feedback inmediato al usuario.
 *
 * El botón es type="submit": el envío lo gestiona el onSubmit del <form> padre,
 * tanto al pulsar como al hacer Enter (sin onClick, para no disparar la petición
 * dos veces por clic de ratón).
 */
function BotonesLogin({ onIrRegistro, cargando = false }) {
  return (
    <div className="botones-login">
      <BotonRegistroLogin type="submit" disabled={cargando}>
        {cargando ? <Spinner tamanio="sm" /> : 'Iniciar sesión'}
      </BotonRegistroLogin>
      <TextoCambiadorLoginRegistro
        texto="¿No tienes cuenta?"
        labelBoton="Registrarse"
        onClick={onIrRegistro}
      />
    </div>
  )
}

export default BotonesLogin
