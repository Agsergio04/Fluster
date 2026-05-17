import { useNavigate } from 'react-router-dom'
import './home.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'
import IntroduccionPagina from '../../components/organismos/IntroduccionPagina'
import InformacionHome from '../../components/moleculas/InformacionHome'

function Home() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario = getUsuario()

  return (
    <div className="home">
      <Header
        rol={usuario?.rol ?? null}
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main>
        <IntroduccionPagina
          onIniciarSesion={() => navigate('/login')}
          onEmpezarAhora={() => navigate('/registro')}
        />

        <section className="home__features" aria-label="Funcionalidades de Fluster">
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
      </main>
    </div>
  )
}

export default Home
