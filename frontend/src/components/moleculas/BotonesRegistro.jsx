import BotonRegistroLogin           from '../atomos/BotonRegistroLogin'
import TextoCambiadorRegistroLogin  from './TextoCambiadorRegistroLogin'

/** Agrupa el botón de crear cuenta y el enlace de cambio a login. */
function BotonesRegistro({ onCrearCuenta, onIrLogin }) {
  return (
    <div className="botones-registro">
      <BotonRegistroLogin onClick={onCrearCuenta}>Crear Cuenta</BotonRegistroLogin>
      <TextoCambiadorRegistroLogin
        texto="Tienes una cuenta"
        labelBoton="Iniciar sesión"
        onClick={onIrLogin}
      />
    </div>
  )
}

export default BotonesRegistro
