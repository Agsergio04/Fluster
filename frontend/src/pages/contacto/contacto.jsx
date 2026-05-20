import { useNavigate } from 'react-router-dom'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'

function Contacto() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario = getUsuario()

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main className="pagina-estatica">
        <section className="pagina-estatica__intro">
          <h1 className="pagina-estatica__titulo">Contacto</h1>
          <p className="pagina-estatica__subtitulo">
            ¿Tienes alguna pregunta, incidencia o sugerencia? Estamos aquí para ayudarte.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Correo de contacto</h2>
          <div className="pagina-estatica__contacto-grid">
            <div className="pagina-estatica__contacto-card">
              <span className="pagina-estatica__contacto-tipo">Contacto general</span>
              <a href="mailto:sergioaragongarcia@gmail.com" className="pagina-estatica__contacto-valor">
                sergioaragongarcia@gmail.com
              </a>
              <p className="pagina-estatica__seccion-texto">
                Cualquier consulta, incidencia o sugerencia sobre la plataforma.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default Contacto
