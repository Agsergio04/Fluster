import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './home.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { getUsuario } from '../../services/session'
import { listarContenedores } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import IntroduccionPagina from '../../components/organismos/IntroduccionPagina'
import InformacionHome from '../../components/moleculas/InformacionHome'

function Home() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario = getUsuario()
  const rol = usuario?.rol ?? null
  useDocumentTitle('Fluster | Gestión de contenedores marítimos')

  // Destino del botón del operador: si aún no ha registrado contenedores lo
  // lleva a introducir uno; si ya tiene, a su listado. Por defecto apunta a
  // "introducir" (coincide con el texto del botón) y se ajusta tras la consulta.
  const [destinoOperador, setDestinoOperador] = useState('/meter-contenedor')

  useEffect(() => {
    if (rol !== 'operador') return
    let activo = true
    listarContenedores()
      .then(lista => { if (activo && lista.length > 0) setDestinoOperador('/contenedores') })
      .catch(() => {})
    return () => { activo = false }
  }, [rol])

  // CTA según el rol para un usuario autenticado; null para invitados, que
  // siguen viendo los botones de iniciar sesión y registro.
  let cta = null
  if (rol === 'admin') {
    cta = { label: 'Gestiona usuarios', onClick: () => navigate('/panel-de-control') }
  } else if (rol === 'gestor') {
    cta = { label: 'Organiza contenedores', onClick: () => navigate('/semaforo') }
  } else if (rol === 'operador') {
    cta = { label: 'Introduce contenedores', onClick: () => navigate(destinoOperador) }
  }

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
