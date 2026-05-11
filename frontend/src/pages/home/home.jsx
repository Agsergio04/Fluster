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
    </main>
  )
}

export default Home
