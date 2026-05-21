import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './login.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { login } from '../../services/authService'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'
import EntradaDatosLogin from '../../components/moleculas/EntradaDatosLogin'
import BotonesLogin from '../../components/moleculas/BotonesLogin'
import imagenLogin from '../../assets/images/imagen_registro-login.jpg'

// Tabla de rutas de aterrizaje según el rol del usuario autenticado.
// Cada rol tiene una sección principal diferente como punto de entrada.
const RUTA_POR_ROL = {
  admin:    '/panel-de-control',
  gestor:   '/semaforo',
  operador: '/meter-contenedor',
}

/**
 * Página de inicio de sesión.
 * Tras una autenticación correcta redirige al usuario a la sección
 * correspondiente a su rol usando la tabla RUTA_POR_ROL.
 * Los errores de campo se muestran bajo el input afectado para guiar
 * al usuario sin limpiar el formulario completo.
 */
function Login() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  useDocumentTitle('Iniciar sesión | Fluster')
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [errorCorreo, setErrorCorreo] = useState('')
  const [errorContrasenia, setErrorContrasenia] = useState('')
  const [cargando, setCargando] = useState(false)

  /**
   * Valida los campos, llama al servicio de autenticación y redirige
   * al área correspondiente según el rol devuelto por el servidor.
   * Si el rol no está en RUTA_POR_ROL redirige a la raíz como fallback.
   */
  const handleIniciarSesion = async () => {
    setErrorCorreo('')
    setErrorContrasenia('')

    if (!correo.trim())     { setErrorCorreo('Introduce tu correo');        return }
    if (!contrasenia.trim()) { setErrorContrasenia('Introduce tu contraseña'); return }

    try {
      setCargando(true)
      const usuario = await login(correo.trim(), contrasenia)
      navigate(RUTA_POR_ROL[usuario.rol] ?? '/')
    } catch (err) {
      const mensaje = err.response?.data?.mensaje ?? 'Credenciales incorrectas'
      const campo   = err.response?.data?.campo
      if (campo === 'correo') setErrorCorreo(mensaje)
      else                    setErrorContrasenia(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <Header
        rol={getUsuario()?.rol ?? null}
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main className="login__body">
        <div className="login__imagen">
          <picture>
            {/* ≥768 px: imagen visible a ~50 % del viewport */}
            <source
              media="(min-width: 768px)"
              srcSet={imagenLogin}
              sizes="50vw"
            />
            <img
              src={imagenLogin}
              alt="Puerto de contenedores"
              width="955"
              height="809"
              fetchPriority="high"
            />
          </picture>
        </div>

        <form
          className="login__panel"
          onSubmit={e => { e.preventDefault(); handleIniciarSesion() }}
        >
          <h1 className="login__titulo">Iniciar Sesion</h1>
          <EntradaDatosLogin
            correo={correo}
            onCorreoCambio={e => setCorreo(e.target.value)}
            errorCorreo={errorCorreo}
            contrasenia={contrasenia}
            onContraseniaCambio={e => setContrasenia(e.target.value)}
            errorContrasenia={errorContrasenia}
          />
          <BotonesLogin
            onIniciarSesion={handleIniciarSesion}
            onIrRegistro={() => navigate('/registro')}
            cargando={cargando}
          />
        </form>
      </main>
    </>
  )
}

export default Login
