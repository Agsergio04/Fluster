import { useNavigate } from 'react-router-dom'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'

function Cookies() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario = getUsuario()
  useDocumentTitle('Política de cookies | Fluster')

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
          <h1 className="pagina-estatica__titulo">Política de Cookies</h1>
          <p className="pagina-estatica__subtitulo">
            Información sobre el uso de cookies y almacenamiento local en Fluster.
            Última actualización: enero de 2025.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">¿Qué es el almacenamiento local?</h2>
          <p className="pagina-estatica__seccion-texto">
            Fluster utiliza <strong>localStorage</strong> y <strong>sessionStorage</strong> del
            navegador en lugar de cookies tradicionales. Estas tecnologías permiten
            guardar datos directamente en tu dispositivo sin enviarlos al servidor
            en cada petición.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Datos que almacenamos</h2>
          <ul className="pagina-estatica__lista">
            <li>
              <strong>localStorage — tema</strong>: preferencia de tema claro u oscuro.
              Persiste entre sesiones del navegador.
            </li>
            <li>
              <strong>sessionStorage — token</strong>: token JWT de autenticación.
              Se elimina automáticamente al cerrar la pestaña o el navegador.
            </li>
            <li>
              <strong>sessionStorage — usuario</strong>: datos básicos del usuario
              autenticado (nombre, correo, rol). Se elimina junto con el token.
            </li>
          </ul>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">No usamos cookies de terceros</h2>
          <p className="pagina-estatica__seccion-texto">
            Fluster no utiliza cookies de seguimiento, publicidad ni analítica de
            terceros. No compartimos datos de almacenamiento con servicios externos.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Gestión del almacenamiento</h2>
          <p className="pagina-estatica__seccion-texto">
            Puedes eliminar estos datos en cualquier momento desde la configuración
            de tu navegador (Ajustes → Privacidad → Borrar datos del sitio).
            Al cerrar sesión en Fluster, los datos de sessionStorage se eliminan
            automáticamente.
          </p>
        </section>
      </main>
    </>
  )
}

export default Cookies
