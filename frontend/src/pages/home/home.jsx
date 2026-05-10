import './home.scss'
import Input from '../../components/atomos/Input'
import InputContrasenia from '../../components/atomos/InputContrasenia'
import BotonRegistroLogin from '../../components/atomos/BotonRegistroLogin'

function Home() {
  return (
    <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>Home</h1>

      <Input
        id="email"
        label="Correo electrónico"
        type="email"
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
    </main>
  )
}

export default Home
