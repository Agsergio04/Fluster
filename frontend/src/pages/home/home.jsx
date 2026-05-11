import { useState } from 'react'
import './home.scss'
import Input from '../../components/atomos/Input'
import InputContrasenia from '../../components/atomos/InputContrasenia'
import BotonRegistroLogin from '../../components/atomos/BotonRegistroLogin'
import BotonCambioRegistroLogin from '../../components/atomos/BotonCambioRegistroLogin'
import BotonRolGestor from '../../components/atomos/BotonRolGestor'
import BotonRolOperador from '../../components/atomos/BotonRolOperador'
import BotonGenerarInforme from '../../components/atomos/BotonGenerarInforme'
import BotonEliminarTarifa from '../../components/atomos/BotonEliminarTarifa'
import BotonActualizarTarifa from '../../components/atomos/BotonActualizarTarifa'
import BotonEliminar from '../../components/atomos/BotonEliminar'
import BotonEditar from '../../components/atomos/BotonEditar'
import BotonEditarCardFecha from '../../components/atomos/BotonEditarCardFecha'
import BotonCambioSeccion from '../../components/atomos/BotonCambioSeccion'
import BotonIrIzquierda from '../../components/atomos/BotonIrIzquierda'
import BotonIrDerecha from '../../components/atomos/BotonIrDerecha'
import BotonBusqueda from '../../components/atomos/BotonBusqueda'
import BotonDecision from '../../components/atomos/BotonDecision'
import BotonEditadoFechaContenedor from '../../components/atomos/BotonEditadoFechaContenedor'
import BotonSeleccionarFoto from '../../components/atomos/BotonSeleccionarFoto'
import BotonEmpezarAhora from '../../components/atomos/BotonEmpezarAhora'
import BotonIniciarSesion from '../../components/atomos/BotonIniciarSesion'
import BotonMenuHamburguesa from '../../components/atomos/BotonMenuHamburguesa'
import BotonCambiarTema from '../../components/atomos/BotonCambiarTema'
import BotonDesplegableHamburguesa from '../../components/atomos/BotonDesplegableHamburguesa'
import ContenedoresFotoIcon from '../../assets/icons/Icono de contenedores por foto.svg?react'
import TarifasIcon from '../../assets/icons/Icono Tarifas.svg?react'
import GestorIcon from '../../assets/icons/Icono Gestor.svg?react'
import ContenedoresIcon from '../../assets/icons/Icono contenedores.svg?react'
import PanelControlIcon from '../../assets/icons/Icono panel de control.svg?react'
import PerfilIcon from '../../assets/icons/Icono Perfil.svg?react'
import TextoCambiadorLoginRegistro from '../../components/moleculas/TextoCambiadorLoginRegistro'
import TextoCambiadorRegistroLogin from '../../components/moleculas/TextoCambiadorRegistroLogin'

function Home() {
  const [tab, setTab] = useState('login')
  return (
    <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>Home</h1>

      <Input
        id="email"
        label="Correo electrónico"
        type="string"
        placeholder="Introduce tu correo"
        value=""
        onChange={() => {}}
        required
        error="Correo no válido"
        hint="Ejemplo: usuario@dominio.com"
      />

      <InputContrasenia
        id="password"
        label="Contraseña"
        required
        size="lg"
      />

      <InputContrasenia
        id="password-error"
        label="Contraseña con error"
        error="La contraseña es incorrecta"
        required
      />

      <BotonRegistroLogin>Registrarse</BotonRegistroLogin>
      <BotonRegistroLogin>Iniciar Sesión</BotonRegistroLogin>
      <BotonRegistroLogin disabled>Registrarse</BotonRegistroLogin>

      <BotonCambioRegistroLogin active={tab} onChange={setTab} />

      <BotonRolGestor
        titulo="Soy Gestor de Operaciones"
        descripcion="Controlo tarifas de navieras, gestiono los contenedores y genero los informes"
      />
      <BotonRolGestor
        titulo="Soy Gestor de Operaciones"
        descripcion="Controlo tarifas de navieras, gestiono los contenedores y genero los informes"
        active
      />
      <BotonRolOperador
        titulo="Soy un Operador"
        descripcion="Introduzco contenedores mediante un sistema OCR"
      />
      <BotonRolOperador
        titulo="Soy un Operador"
        descripcion="Introduzco contenedores mediante un sistema OCR"
        active
      />

      <TextoCambiadorLoginRegistro
        texto="¿No tienes cuenta?"
        labelBoton="Registrarse"
        onClick={() => {}}
      />
      <TextoCambiadorLoginRegistro
        texto="¿Ya tienes cuenta?"
        labelBoton="Iniciar sesión"
        onClick={() => {}}
      />
      <TextoCambiadorRegistroLogin
        texto="Tienes una cuenta"
        labelBoton="Iniciar sesión"
        onClick={() => {}}
      />

      <BotonGenerarInforme onClick={() => {}}/>
      <BotonGenerarInforme disabled />

      <BotonEliminarTarifa onClick={() => {}} />
      <BotonEliminarTarifa disabled />

      <BotonActualizarTarifa onClick={() => {}} />
      <BotonActualizarTarifa disabled />

      <BotonEliminar onClick={() => {}} />
      <BotonEliminar disabled size="md"/>

      <BotonEditar onClick={() => {}} />
      <BotonEditar disabled />

      <BotonEditarCardFecha onClick={() => {}} />
      <BotonEditarCardFecha disabled />

      <BotonCambioSeccion onClick={() => {}}>1</BotonCambioSeccion>
      <BotonCambioSeccion active onClick={() => {}}>2</BotonCambioSeccion>
      <BotonCambioSeccion disabled>3</BotonCambioSeccion>

      <BotonIrIzquierda onClick={() => {}} />
      <BotonIrIzquierda disabled />

      <BotonIrDerecha onClick={() => {}} />
      <BotonIrDerecha disabled />

      <BotonBusqueda onClick={() => {}} />
      <BotonBusqueda disabled />

      <BotonDecision onClick={() => {}} />
      <BotonDecision selected onClick={() => {}} />
      <BotonDecision disabled />

      <BotonEditadoFechaContenedor onClick={() => {}} />
      <BotonEditadoFechaContenedor disabled />

      <BotonSeleccionarFoto onClick={() => {}} />
      <BotonSeleccionarFoto disabled />

      <BotonEmpezarAhora onClick={() => {}} />
      <BotonEmpezarAhora disabled />

      <BotonIniciarSesion onClick={() => {}} />
      <BotonIniciarSesion disabled />

      <BotonMenuHamburguesa onClick={() => {}} />
      <BotonMenuHamburguesa disabled />

      <BotonCambiarTema theme="light" onClick={() => {}} />
      <BotonCambiarTema theme="dark" onClick={() => {}} />

      <BotonDesplegableHamburguesa icon={<ContenedoresFotoIcon />} label="Meter contenedor" onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<TarifasIcon />} label="Tarifas" onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<GestorIcon />} label="Seguimiento" active onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<ContenedoresIcon />} label="Almacen" onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<ContenedoresIcon />} label="Contenedores" onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<PanelControlIcon />} label="Panel de control" onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<PerfilIcon />} label="Perfil" disabled />
    </main>
  )
}

export default Home
