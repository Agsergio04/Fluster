import { useNavigate } from 'react-router-dom'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'

function Terminos() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario = getUsuario()
  useDocumentTitle('Términos de servicio | Fluster')

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
          <h1 className="pagina-estatica__titulo">Términos de Servicio</h1>
          <p className="pagina-estatica__subtitulo">
            Al utilizar Fluster aceptas los siguientes términos y condiciones.
            Última actualización: enero de 2025.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">1. Uso del servicio</h2>
          <p className="pagina-estatica__seccion-texto">
            Fluster es una plataforma de gestión de contenedores marítimos destinada
            a empresas y profesionales del sector logístico. El acceso está restringido
            a usuarios registrados con un rol asignado por el administrador de la cuenta.
          </p>
          <ul className="pagina-estatica__lista">
            <li>Debes tener al menos 18 años para utilizar el servicio.</li>
            <li>Eres responsable de mantener la confidencialidad de tus credenciales.</li>
            <li>Queda prohibido el uso de la plataforma para fines ilícitos.</li>
          </ul>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">2. Cuentas de usuario</h2>
          <p className="pagina-estatica__seccion-texto">
            Cada cuenta dispone de un rol (administrador, gestor u operador) que
            determina las acciones permitidas dentro de la plataforma. El administrador
            es el único que puede crear, modificar o eliminar cuentas de otros usuarios.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">3. Propiedad intelectual</h2>
          <p className="pagina-estatica__seccion-texto">
            Todos los derechos sobre el software, diseño, logotipos y contenidos de
            Fluster son propiedad de sus creadores. No se permite la reproducción,
            distribución o modificación sin autorización expresa por escrito.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">4. Limitación de responsabilidad</h2>
          <p className="pagina-estatica__seccion-texto">
            Fluster se proporciona "tal cual". No garantizamos la disponibilidad
            continua del servicio ni nos responsabilizamos de pérdidas derivadas
            de interrupciones, errores en los datos o uso indebido de la plataforma.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">5. Contacto</h2>
          <p className="pagina-estatica__seccion-texto">
            Para cualquier consulta sobre estos términos puedes contactarnos a través
            de la página de <a href="/contacto" className="pagina-estatica__contacto-valor">Contacto</a>.
          </p>
        </section>
      </main>
    </>
  )
}

export default Terminos
