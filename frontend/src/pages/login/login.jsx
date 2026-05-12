import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './login.scss'
import { login } from '../../services/authService'
import Header from '../../components/organismos/Header'
import EntradaDatosLogin from '../../components/moleculas/EntradaDatosLogin'
import BotonesLogin from '../../components/moleculas/BotonesLogin'
import imagenLogin from '../../assets/images/imagen_registro-login.png'

const RUTA_POR_ROL = {
  admin:    '/panel-de-control',
  gestor:   '/semaforo',
  operador: '/meter-contenedor',
}

function Login() {
  const navigate = useNavigate()
  const [tema, setTema] = useState('light')
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [errorCorreo, setErrorCorreo] = useState('')
  const [errorContrasenia, setErrorContrasenia] = useState('')
  const [cargando, setCargando] = useState(false)

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
      setErrorContrasenia(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login">
      <Header
        rol={null}
        tema={tema}
        onToggleTema={() => setTema(t => t === 'light' ? 'dark' : 'light')}
      />

      <div className="login__body">
        <div className="login__imagen">
          <img src={imagenLogin} alt="Puerto de contenedores" />
        </div>

        <div className="login__panel">
          <h2 className="login__titulo">Iniciar Sesion</h2>
          <EntradaDatosLogin
            nombre={correo}
            onNombreCambio={e => setCorreo(e.target.value)}
            errorNombre={errorCorreo}
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
      </div>
    </div>
  )
}

export default Login
