/**
 * Par de pestañas (login / registro) para alternar entre los dos modos de acceso.
 * aria-pressed indica al lector de pantalla cuál está seleccionada.
 *
 * @param {'login'|'registro'} active
 * @param {function} onChange - Recibe 'login' o 'registro'
 */
function BotonCambioRegistroLogin({ active = 'login', onChange }) {
  return (
    <div className="btn-cambio-registro-login">
      <button
        className={`btn-cambio-registro-login__tab${active === 'login' ? ' btn-cambio-registro-login__tab--active' : ''}`}
        type="button"
        aria-pressed={active === 'login'}
        onClick={() => onChange?.('login')}
      >
        Iniciar sesión
      </button>
      <button
        className={`btn-cambio-registro-login__tab${active === 'registro' ? ' btn-cambio-registro-login__tab--active' : ''}`}
        type="button"
        aria-pressed={active === 'registro'}
        onClick={() => onChange?.('registro')}
      >
        Registrarse
      </button>
    </div>
  )
}

export default BotonCambioRegistroLogin
