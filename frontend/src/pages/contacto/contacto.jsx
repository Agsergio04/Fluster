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
          <h2 className="pagina-estatica__seccion-titulo">Canales de contacto</h2>
          <div className="pagina-estatica__contacto-grid">
            <div className="pagina-estatica__contacto-card">
              <span className="pagina-estatica__contacto-tipo">Soporte técnico</span>
              <a href="mailto:soporte@fluster.app" className="pagina-estatica__contacto-valor">
                soporte@fluster.app
              </a>
              <p className="pagina-estatica__seccion-texto">
                Incidencias con la plataforma, errores o problemas de acceso.
              </p>
            </div>
            <div className="pagina-estatica__contacto-card">
              <span className="pagina-estatica__contacto-tipo">Privacidad y datos</span>
              <a href="mailto:privacidad@fluster.app" className="pagina-estatica__contacto-valor">
                privacidad@fluster.app
              </a>
              <p className="pagina-estatica__seccion-texto">
                Ejercicio de derechos RGPD: acceso, rectificación o supresión de datos.
              </p>
            </div>
            <div className="pagina-estatica__contacto-card">
              <span className="pagina-estatica__contacto-tipo">Información general</span>
              <a href="mailto:hola@fluster.app" className="pagina-estatica__contacto-valor">
                hola@fluster.app
              </a>
              <p className="pagina-estatica__seccion-texto">
                Consultas sobre el servicio, colaboraciones o cualquier otra pregunta.
              </p>
            </div>
          </div>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Tiempo de respuesta</h2>
          <p className="pagina-estatica__seccion-texto">
            Respondemos en un plazo máximo de 48 horas en días laborables.
            Para incidencias urgentes relacionadas con acceso a la cuenta,
            indica en el asunto del correo <strong>[URGENTE]</strong>.
          </p>
        </section>
      </main>
    </>
  )
}

export default Contacto
