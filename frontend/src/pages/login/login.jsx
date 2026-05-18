import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './login.scss'
import useTema from '../../hooks/useTema'
import { login } from '../../services/authService'
import Header from '../../components/organismos/Header'
import EntradaDatosLogin from '../../components/moleculas/EntradaDatosLogin'
import BotonesLogin from '../../components/moleculas/BotonesLogin'
import imagenLogin from '../../assets/images/imagen_registro-login.png'

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
      // El error se muestra bajo el campo de contraseña para no revelar
      // si el correo existe en el sistema (evita enumeración de usuarios)
      const mensaje = err.response?.data?.mensaje ?? 'Credenciales incorrectas'
      setErrorContrasenia(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <Header
        rol={null}
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main className="login__body">
        <div className="login__imagen">
          <img src={imagenLogin} alt="Puerto de contenedores" />
        </div>

        <div className="login__panel">
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
            disabled={cargando}
          />
        </div>
      </main>
    </>
  )
}

export default Login
