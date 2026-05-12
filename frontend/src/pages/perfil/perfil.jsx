import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './perfil.scss'
import { getUsuario, limpiarSesion } from '../../services/session'
import Header from '../../components/organismos/Header'
import PerfilCredenciales from '../../components/organismos/PerfilCredenciales'

function Perfil() {
  const navigate        = useNavigate()
  const usuario         = getUsuario()
  const [tema, setTema] = useState('light')

  const [nuevoNombre,   setNuevoNombre]   = useState('')
  const [contrasenia,   setContrasenia]   = useState('')
  const [confirmacion,  setConfirmacion]  = useState('')
  const [errorNombre,   setErrorNombre]   = useState('')
  const [errorContrasenia,  setErrorContrasenia]  = useState('')
  const [errorConfirmacion, setErrorConfirmacion] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleConfirmarNombre = async () => {
    setErrorNombre('')
    if (!nuevoNombre.trim()) { setErrorNombre('Introduce tu nuevo nombre'); return }
    // TODO: conectar con authService.actualizarNombre()
  }

  const handleConfirmarContrasenia = async () => {
    setErrorContrasenia('')
    setErrorConfirmacion('')
    if (!contrasenia.trim()) { setErrorContrasenia('Introduce tu nueva contraseña'); return }
    if (contrasenia !== confirmacion) { setErrorConfirmacion('Las contraseñas no coinciden'); return }
    // TODO: conectar con authService.actualizarContrasenia()
  }

  const handleCerrarSesion = () => {
    limpiarSesion()
    navigate('/')
  }

  return (
    <div className="perfil">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="perfil"
        tema={tema}
        onToggleTema={() => setTema(t => t === 'light' ? 'dark' : 'light')}
        onNavegar={ruta => navigate(ruta)}
      />

      <section className="perfil__intro">
        <h1 className="perfil__titulo">Perfil</h1>
        <p className="perfil__subtitulo">
          Aqui se encuentra tanto la informacion personal como el cambio de credenciales
        </p>
      </section>

      <div className="perfil__contenido">
        <PerfilCredenciales
          foto={null}
          nombre={usuario?.nombre ?? ''}
          rol={usuario?.rol ?? ''}
          correo={usuario?.correo ?? ''}
          onActualizarFoto={() => {}}
          nuevoNombre={nuevoNombre}
          onNuevoNombreCambio={e => setNuevoNombre(e.target.value)}
          errorNombre={errorNombre}
          onConfirmarNombre={handleConfirmarNombre}
          disabledNombre={cargando}
          contrasenia={contrasenia}
          onContraseniaCambio={e => setContrasenia(e.target.value)}
          confirmacion={confirmacion}
          onConfirmacionCambio={e => setConfirmacion(e.target.value)}
          errorContrasenia={errorContrasenia}
          errorConfirmacion={errorConfirmacion}
          onConfirmarContrasenia={handleConfirmarContrasenia}
          disabledContrasenia={cargando}
          onCerrarSesion={handleCerrarSesion}
        />
      </div>
    </div>
  )
}

export default Perfil
