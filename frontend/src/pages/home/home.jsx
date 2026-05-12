import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './home.scss'
import Header from '../../components/organismos/Header'
import IntroduccionPagina from '../../components/organismos/IntroduccionPagina'
import InformacionHome from '../../components/moleculas/InformacionHome'

function Home() {
  const navigate = useNavigate()
  const [tema, setTema] = useState('light')

  return (
    <div className="home">
      <Header
        rol={null}
        tema={tema}
        onToggleTema={() => setTema(t => t === 'light' ? 'dark' : 'light')}
      />

      <IntroduccionPagina
        onIniciarSesion={() => navigate('/login')}
        onEmpezarAhora={() => navigate('/registro')}
      />

      <section className="home__features">
        <article className="home__feature">
          <InformacionHome variante="tarifas" />
        </article>
        <article className="home__feature">
          <InformacionHome variante="ocr" />
        </article>
        <article className="home__feature home__feature--wide">
          <InformacionHome variante="semaforo" />
        </article>
      </section>
    </div>
  )
}

export default Home
