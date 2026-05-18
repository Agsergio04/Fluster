import BotonRegistroLogin          from '../atomos/BotonRegistroLogin'
import TextoCambiadorLoginRegistro from './TextoCambiadorLoginRegistro'

/** Agrupa el botón principal de login y el enlace de cambio a registro. */
function BotonesLogin({ onIniciarSesion, onIrRegistro }) {
  return (
    <div className="botones-login">
      <BotonRegistroLogin onClick={onIniciarSesion}>Iniciar Sesión</BotonRegistroLogin>
      <TextoCambiadorLoginRegistro
        texto="¿No tienes cuenta?"
        labelBoton="Registrarse"
        onClick={onIrRegistro}
      />
    </div>
  )
}

export default BotonesLogin
