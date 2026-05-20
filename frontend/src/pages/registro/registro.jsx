import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './registro.scss'
import useTema from '../../hooks/useTema'
import { registro } from '../../services/authService'
import Header from '../../components/organismos/Header'
import EntradaDatosRegistro from '../../components/moleculas/EntradaDatosRegistro'
import BotonesSeleccionRol from '../../components/moleculas/BotonesSeleccionRol'
import BotonesRegistro from '../../components/moleculas/BotonesRegistro'
import imagenRegistro from '../../assets/images/imagen_registro-login.jpg'

/**
 * Página de creación de cuenta nueva.
 * El rol se elige en el mismo formulario mediante botones de selección;
 * el formulario no permite enviar sin haber elegido uno.
 * Tras el registro exitoso redirige al login para que el usuario
 * inicie sesión con las credenciales recién creadas.
 */
function Registro() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  // null mientras no se selecciona ningún botón de rol
  const [rol, setRol] = useState(null)
  const [errorNombre, setErrorNombre] = useState('')
  const [errorCorreo, setErrorCorreo] = useState('')
  const [errorContrasenia, setErrorContrasenia] = useState('')
  const [errorRol, setErrorRol] = useState('')
  const [cargando, setCargando] = useState(false)

  /**
   * Valida cada campo de forma secuencial y detiene el proceso
   * en el primer error encontrado para mostrar un único mensaje de error
   * claro sin saturar el formulario con múltiples alertas a la vez.
   */
  const handleCrearCuenta = async () => {
    setErrorNombre('')
    setErrorCorreo('')
    setErrorContrasenia('')
    setErrorRol('')

    if (!nombre.trim())      { setErrorNombre('Introduce tu nombre');          return }
    if (!correo.trim())      { setErrorCorreo('Introduce tu correo');          return }
    if (!contrasenia.trim()) { setErrorContrasenia('Introduce tu contraseña'); return }
    if (!rol)                { setErrorRol('Selecciona un rol');               return }

    try {
      setCargando(true)
      await registro(nombre.trim(), correo.trim(), contrasenia, rol)
      navigate('/login')
    } catch (err) {
      // Los errores del servidor (p. ej. correo ya registrado) se muestran
      // bajo el campo de correo, que es el más probable origen del conflicto
      const mensaje = err.response?.data?.mensaje ?? 'Error al crear la cuenta'
      setErrorCorreo(mensaje)
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
          <h1 className="registro__titulo">Registro</h1>

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
          />

          {/* Grupo de selección de rol con etiqueta accesible via aria-labelledby */}
          <div
            className="registro__rol"
            role="group"
            aria-labelledby="registro-rol-titulo"
          >
            <p className="registro__rol-titulo" id="registro-rol-titulo">Rol Asignado</p>
            {errorRol && <p className="registro__rol-error" role="alert">{errorRol}</p>}
            <BotonesSeleccionRol
              rolSeleccionado={rol}
              onSeleccionarRol={setRol}
            />
          </div>

          <BotonesRegistro
            onCrearCuenta={handleCrearCuenta}
            onIrLogin={() => navigate('/login')}
            disabled={cargando}
          />
        </form>
      </main>
    </>
  )
}

export default Registro
