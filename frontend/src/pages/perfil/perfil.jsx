import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './perfil.scss'
import useTema from '../../hooks/useTema'
import { getUsuario, limpiarSesion, actualizarUsuario } from '../../services/session'
import { actualizarFoto, actualizarNombre, cambiarContrasena } from '../../services/usuarioService'
import Header from '../../components/organismos/Header'
import PerfilCredenciales from '../../components/organismos/PerfilCredenciales'

/**
 * Página de gestión del perfil de usuario.
 * Permite cambiar el nombre de visualización, la foto de perfil
 * y la contraseña de acceso. Todos los cambios se reflejan de inmediato
 * en la sesión local (localStorage) sin necesidad de cerrar sesión.
 */
function Perfil() {
  const navigate        = useNavigate()
  const usuario         = getUsuario()
  const [tema, toggleTema] = useTema()

  // La foto se inicializa desde la sesión guardada para mostrarse
  // sin esperar una nueva petición al servidor
  const [foto,          setFoto]          = useState(usuario?.foto ?? null)
  const [nuevoNombre,          setNuevoNombre]          = useState('')
  const [contraseniaActual,    setContraseniaActual]    = useState('')
  const [contrasenia,          setContrasenia]          = useState('')
  const [confirmacion,         setConfirmacion]         = useState('')
  const [errorNombre,          setErrorNombre]          = useState('')
  const [errorContraseniaActual, setErrorContraseniaActual] = useState('')
  const [errorContrasenia,     setErrorContrasenia]     = useState('')
  const [errorConfirmacion,    setErrorConfirmacion]    = useState('')
  const [cargando, setCargando] = useState(false)

  /**
   * Actualiza el nombre en el servidor y sincroniza la sesión local
   * para que la cabecera muestre el nuevo nombre sin recargar la página.
   */
  const handleConfirmarNombre = async () => {
    setErrorNombre('')
    if (!nuevoNombre.trim()) { setErrorNombre('Introduce tu nuevo nombre'); return }
    try {
      setCargando(true)
      const actualizado = await actualizarNombre(usuario.id, nuevoNombre.trim())
      actualizarUsuario({ nombre: actualizado.nombre })
      setNuevoNombre('')
    } catch (err) {
      setErrorNombre(err.response?.data?.mensaje ?? 'Error al cambiar el nombre')
    } finally {
      setCargando(false)
    }
  }

  /**
   * Cambia la contraseña del usuario. Requiere la contraseña actual para
   * prevenir cambios no autorizados en sesiones desatendidas.
   * La confirmación se valida en cliente para dar feedback inmediato
   * antes de enviar la petición al servidor.
   */
  const handleConfirmarContrasenia = async () => {
    setErrorContraseniaActual('')
    setErrorContrasenia('')
    setErrorConfirmacion('')
    if (!contraseniaActual.trim()) { setErrorContraseniaActual('Introduce tu contraseña actual'); return }
    if (!contrasenia.trim())       { setErrorContrasenia('Introduce tu nueva contraseña'); return }
    if (contrasenia !== confirmacion) { setErrorConfirmacion('Las contraseñas no coinciden'); return }
    try {
      setCargando(true)
      await cambiarContrasena(usuario.id, contraseniaActual, contrasenia)
      setContraseniaActual('')
      setContrasenia('')
      setConfirmacion('')
    } catch (err) {
      setErrorContraseniaActual(err.response?.data?.mensaje ?? 'Error al cambiar la contraseña')
    } finally {
      setCargando(false)
    }
  }

  /**
   * Sube la nueva foto de perfil al servidor y actualiza tanto el estado
   * local del componente como la sesión guardada en localStorage para que
   * el avatar en la cabecera se actualice sin recargar.
   *
   * @param {string} fotoBase64 - Imagen en formato data URL (base64)
   */
  const handleActualizarFoto = async fotoBase64 => {
    try {
      await actualizarFoto(usuario.id, fotoBase64)
      setFoto(fotoBase64)
      actualizarUsuario({ foto: fotoBase64 })
    } catch (err) {
      console.error('Error al actualizar foto:', err.response?.data ?? err.message)
    }
  }

  /** Limpia el token y los datos de sesión y redirige a la página de inicio. */
  const handleCerrarSesion = () => {
    limpiarSesion()
    navigate('/')
  }

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="perfil"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main>
        <section className="perfil__intro">
          <h1 className="perfil__titulo">Perfil</h1>
          <p className="perfil__subtitulo">
            Aqui se encuentra tanto la informacion personal como el cambio de credenciales
          </p>
        </section>

        <div className="perfil__contenido">
          <PerfilCredenciales
            foto={foto}
            nombre={usuario?.nombre ?? ''}
            rol={usuario?.rol ?? ''}
            correo={usuario?.correo ?? ''}
            onActualizarFoto={handleActualizarFoto}
            nuevoNombre={nuevoNombre}
            onNuevoNombreCambio={e => setNuevoNombre(e.target.value)}
            errorNombre={errorNombre}
            onConfirmarNombre={handleConfirmarNombre}
            disabledNombre={cargando}
            contraseniaActual={contraseniaActual}
            onContraseniaActualCambio={e => setContraseniaActual(e.target.value)}
            errorContraseniaActual={errorContraseniaActual}
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
      </main>
    </>
  )
}

export default Perfil
