import { useNavigate } from 'react-router-dom'
import './home.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import useDestinoRol from '../../hooks/useDestinoRol'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'
import IntroduccionPagina from '../../components/organismos/IntroduccionPagina'
import InformacionHome from '../../components/moleculas/InformacionHome'

// Texto del botón de acción de la landing según el rol. El destino lo resuelve
// useDestinoRol (el mismo al que redirigen /login y /registro con sesión activa).
const ETIQUETAS_CTA = {
  admin:    'Gestiona usuarios',
  gestor:   'Organiza contenedores',
  operador: 'Introduce contenedores',
}

function Home() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario = getUsuario()
  const rol = usuario?.rol ?? null
  useDocumentTitle('Fluster | Gestión de contenedores marítimos')

  const { destino } = useDestinoRol()

  // CTA por rol para un usuario autenticado; null para invitados, que siguen
  // viendo los botones de iniciar sesión y registro.
  const cta = rol && ETIQUETAS_CTA[rol]
    ? { label: ETIQUETAS_CTA[rol], onClick: () => navigate(destino) }
    : null

  return (
    <>
      <Header
        rol={rol}
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main>
        <IntroduccionPagina
          cta={cta}
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
    </>
  )
}

export default Home
