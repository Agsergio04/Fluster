import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './registro.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { registro, login } from '../../services/authService'
import { resolverDestinoRol } from '../../hooks/useDestinoRol'
import { getUsuario } from '../../services/session'
import { contraseniaValida } from '../../services/contrasenia'
import Header from '../../components/organismos/Header'
import EntradaDatosRegistro from '../../components/moleculas/EntradaDatosRegistro'
import BotonesSeleccionRol from '../../components/moleculas/BotonesSeleccionRol'
import BotonesRegistro from '../../components/moleculas/BotonesRegistro'
import imagenRegistro from '../../assets/images/imagen_registro-login.jpg'

// Validación pragmática de formato de email: algo@algo.algo, sin espacios y
// sin puntos consecutivos (el lookahead (?!.*\.\.) rechaza ".." en cualquier parte).
const EMAIL_REGEX = /^(?!.*\.\.)[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Página de creación de cuenta nueva.
 * El rol se elige en el mismo formulario mediante botones de selección;
 * el formulario no permite enviar sin haber elegido uno.
 * Tras el registro exitoso inicia sesión automáticamente con las credenciales
 * recién creadas y lleva al usuario al destino de su rol; si el auto-login
 * fallara, cae al login manual.
 */
function Registro() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  useDocumentTitle('Registro | Fluster')
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  // null mientras no se selecciona ningún botón de rol
  const [rol, setRol] = useState(null)
  const [errorNombre, setErrorNombre] = useState('')
  const [errorCorreo, setErrorCorreo] = useState('')
  const [errorContrasenia, setErrorContrasenia] = useState('')
  const [errorConfirmacion, setErrorConfirmacion] = useState('')
  const [errorRol, setErrorRol] = useState('')
  const [cargando, setCargando] = useState(false)
  // Guard síncrono contra doble envío (el estado `cargando` no se actualiza a
  // tiempo dentro del mismo dispatch), coherente con el login.
  const enviando = useRef(false)

  /**
   * Valida cada campo de forma secuencial y detiene el proceso
   * en el primer error encontrado para mostrar un único mensaje de error
   * claro sin saturar el formulario con múltiples alertas a la vez.
   */
  const handleCrearCuenta = async () => {
    if (enviando.current) return
    setErrorNombre('')
    setErrorCorreo('')
    setErrorContrasenia('')
    setErrorConfirmacion('')
    setErrorRol('')

    if (!nombre.trim())                   { setErrorNombre('Introduce tu nombre');          return }
    if (!correo.trim())                   { setErrorCorreo('Introduce tu correo');          return }
    if (!EMAIL_REGEX.test(correo.trim())) { setErrorCorreo('Introduce un correo válido');   return }
    if (!contrasenia.trim())              { setErrorContrasenia('Introduce tu contraseña'); return }
    if (!contraseniaValida(contrasenia))  { setErrorContrasenia('La contraseña no cumple los requisitos indicados'); return }
    if (contrasenia !== confirmacion)     { setErrorConfirmacion('Las contraseñas no coinciden'); return }
    if (!rol)                             { setErrorRol('Selecciona un rol');               return }

    try {
      enviando.current = true
      setCargando(true)
      await registro(nombre.trim(), correo.trim(), contrasenia, rol)
      // Auto-login para no obligar a re-introducir credenciales; si falla, login manual.
      try {
        const usuario = await login(correo.trim(), contrasenia)
        navigate(await resolverDestinoRol(usuario.rol))
      } catch {
        navigate('/login')
      }
    } catch (err) {
      // Los errores del servidor (p. ej. correo ya registrado) se muestran
      // bajo el campo de correo, que es el más probable origen del conflicto
      const mensaje = err.response?.data?.mensaje ?? 'Error al crear la cuenta'
      setErrorCorreo(mensaje)
    } finally {
      enviando.current = false
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

      <main className="registro__body">
        <div className="registro__imagen">
          <picture>
            {/* ≥768 px: imagen visible a ~50 % del viewport */}
            <source
              media="(min-width: 768px)"
              srcSet={imagenRegistro}
              sizes="50vw"
            />
            <img
              src={imagenRegistro}
              alt="Puerto de contenedores"
              width="955"
              height="809"
              fetchPriority="high"
            />
          </picture>
        </div>

        <form
          className="registro__panel"
          onSubmit={e => { e.preventDefault(); handleCrearCuenta() }}
        >
          <header className="registro__cabecera">
            <h1 className="registro__titulo">Registro</h1>
            <p className="registro__subtitulo">
              Crea tu cuenta para gestionar tus contenedores y controlar los costes de demora y detención.
            </p>
          </header>

          <EntradaDatosRegistro
            nombre={nombre}
            onNombreCambio={e => setNombre(e.target.value)}
            errorNombre={errorNombre}
            correo={correo}
            onCorreoCambio={e => setCorreo(e.target.value)}
            errorCorreo={errorCorreo}
            contrasenia={contrasenia}
            onContraseniaCambio={e => setContrasenia(e.target.value)}
            errorContrasenia={errorContrasenia}
            confirmacion={confirmacion}
            onConfirmacionCambio={e => setConfirmacion(e.target.value)}
            errorConfirmacion={errorConfirmacion}
          />

          {/* Grupo de selección de rol con etiqueta accesible via aria-labelledby */}
          <div
            className="registro__rol"
            role="group"
            aria-labelledby="registro-rol-titulo"
          >
            <p className="registro__rol-titulo" id="registro-rol-titulo">Rol asignado</p>
            {errorRol && <p className="registro__rol-error" role="alert">{errorRol}</p>}
            <BotonesSeleccionRol
              rolSeleccionado={rol}
              onSeleccionarRol={setRol}
            />
          </div>

          <BotonesRegistro
            onIrLogin={() => navigate('/login')}
            disabled={cargando}
          />
        </form>
      </main>
    </>
  )
}

export default Registro
