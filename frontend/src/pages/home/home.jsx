import './home.scss'
import Input from '../../components/atomos/Input'

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
    </main>
  )
}

export default Home
