import { useNavigate } from 'react-router-dom'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'

function Contacto() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario = getUsuario()
  useDocumentTitle('Contacto | Fluster')

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main className="pagina-estatica">
        <button type="button" className="pagina-estatica__volver" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <section className="pagina-estatica__intro">
          <h1 className="pagina-estatica__titulo">Contacto</h1>
          <p className="pagina-estatica__subtitulo">
            ¿Tienes alguna pregunta? Escríbenos y te responderemos lo antes posible.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <div className="pagina-estatica__contacto-card">
            <span className="pagina-estatica__contacto-tipo">Correo electrónico</span>
            <a className="pagina-estatica__contacto-valor" href="mailto:agsergio@iesrafaelalberti.es">agsergio@iesrafaelalberti.es</a>
            <p className="pagina-estatica__seccion-texto">Respuesta en 24–48 horas.</p>
          </div>
        </section>
      </main>
    </>
  )
}

export default Contacto
