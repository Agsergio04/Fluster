import { useNavigate } from 'react-router-dom'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'

function Privacidad() {
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
          <h1 className="pagina-estatica__titulo">Política de Privacidad</h1>
          <p className="pagina-estatica__subtitulo">
            Describimos cómo recogemos, usamos y protegemos tus datos personales
            de acuerdo con el Reglamento General de Protección de Datos (RGPD).
            Última actualización: enero de 2025.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">1. Datos que recopilamos</h2>
          <p className="pagina-estatica__seccion-texto">
            Al registrarte y utilizar Fluster recopilamos únicamente los datos
            necesarios para el funcionamiento del servicio:
          </p>
          <ul className="pagina-estatica__lista">
            <li>Nombre y dirección de correo electrónico.</li>
            <li>Contraseña almacenada de forma cifrada (bcrypt).</li>
            <li>Datos operativos introducidos: contenedores, tarifas y clientes.</li>
            <li>Foto de perfil opcional.</li>
          </ul>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">2. Cómo usamos tus datos</h2>
          <p className="pagina-estatica__seccion-texto">
            Los datos recopilados se utilizan exclusivamente para:
          </p>
          <ul className="pagina-estatica__lista">
            <li>Autenticarte y gestionar tu sesión en la plataforma.</li>
            <li>Operar las funcionalidades de gestión de contenedores.</li>
            <li>Generar informes de demurrage y detention.</li>
            <li>Mejorar el servicio mediante análisis de uso agregado y anónimo.</li>
          </ul>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">3. Conservación de datos</h2>
          <p className="pagina-estatica__seccion-texto">
            Conservamos tus datos mientras tu cuenta esté activa. Al eliminar una
            cuenta, los datos asociados se borran de forma permanente salvo obligación
            legal de retención.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">4. Tus derechos</h2>
          <p className="pagina-estatica__seccion-texto">
            Conforme al RGPD tienes derecho a acceder, rectificar, suprimir,
            limitar el tratamiento y portar tus datos. Para ejercer estos
            derechos contacta con nosotros a través de la página de{' '}
            <a href="/contacto" style={{ color: 'var(--color-primary)' }}>Contacto</a>.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">5. Seguridad</h2>
          <p className="pagina-estatica__seccion-texto">
            Aplicamos medidas técnicas y organizativas para proteger tus datos:
            cifrado de contraseñas, comunicaciones HTTPS, control de acceso
            basado en roles y tokens JWT de sesión.
          </p>
        </section>
      </main>
    </>
  )
}

export default Privacidad
