import Spinner                     from '../atomos/Spinner'
import BotonRegistroLogin          from '../atomos/BotonRegistroLogin'
import TextoCambiadorLoginRegistro from './TextoCambiadorLoginRegistro'

/**
 * Agrupa el botón principal de login y el enlace de cambio a registro.
 * Cuando cargando es true el botón queda deshabilitado y muestra un spinner
 * en lugar del texto para dar feedback inmediato al usuario.
 */
function BotonesLogin({ onIniciarSesion, onIrRegistro, cargando = false }) {
  return (
    <div className="botones-login">
      <BotonRegistroLogin onClick={onIniciarSesion} disabled={cargando}>
        {cargando ? <Spinner tamanio="sm" /> : 'Iniciar Sesión'}
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
