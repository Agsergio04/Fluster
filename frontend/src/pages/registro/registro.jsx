import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './registro.scss'
import useTema from '../../hooks/useTema'
import { registro } from '../../services/authService'
import Header from '../../components/organismos/Header'
import EntradaDatosRegistro from '../../components/moleculas/EntradaDatosRegistro'
import BotonesSeleccionRol from '../../components/moleculas/BotonesSeleccionRol'
import BotonesRegistro from '../../components/moleculas/BotonesRegistro'
import imagenRegistro from '../../assets/images/imagen_registro-login.png'

function Registro() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [rol, setRol] = useState(null)
  const [errorNombre, setErrorNombre] = useState('')
  const [errorCorreo, setErrorCorreo] = useState('')
  const [errorContrasenia, setErrorContrasenia] = useState('')
  const [errorRol, setErrorRol] = useState('')
  const [cargando, setCargando] = useState(false)

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
      const mensaje = err.response?.data?.mensaje ?? 'Error al crear la cuenta'
      setErrorCorreo(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="registro">
      <Header
        rol={null}
        tema={tema}
        onToggleTema={toggleTema}
      />

      <div className="registro__body">
        <div className="registro__imagen">
          <img src={imagenRegistro} alt="Puerto de contenedores" />
        </div>

        <div className="registro__panel">
          <h2 className="registro__titulo">Registro</h2>

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

          <div className="registro__rol">
            <p className="registro__rol-titulo">Rol Asignado</p>
            {errorRol && <p className="registro__rol-error">{errorRol}</p>}
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
        </div>
      </div>
    </div>
  )
}

export default Registro
