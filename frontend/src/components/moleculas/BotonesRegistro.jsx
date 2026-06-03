import BotonRegistroLogin           from '../atomos/BotonRegistroLogin'
import TextoCambiadorRegistroLogin  from './TextoCambiadorRegistroLogin'

/**
 * Agrupa el botón de crear cuenta y el enlace de cambio a login.
 * El botón es `type="submit"` sin `onClick`: el envío lo gestiona el
 * `onSubmit` del formulario, de modo que la validación nativa del navegador
 * se ejecuta y el handler se dispara una sola vez (evita el doble envío).
 */
function BotonesRegistro({ onIrLogin, disabled = false }) {
  return (
    <div className="botones-registro">
      <BotonRegistroLogin type="submit" disabled={disabled}>Crear cuenta</BotonRegistroLogin>
      <TextoCambiadorRegistroLogin
        texto="Tienes una cuenta"
        labelBoton="Iniciar sesión"
        onClick={onIrLogin}
      />
    </div>
  )
}

export default BotonesRegistro
