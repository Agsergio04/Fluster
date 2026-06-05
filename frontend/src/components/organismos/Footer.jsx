import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__marca">
        <Link to="/">
          <img
            src="/logo-fluster.svg"
            alt="Fluster"
            className="footer__logo"
            width="343"
            height="343"
            decoding="async"
          />
        </Link>
      </div>

      <div className="footer__secciones">
        <div className="footer__seccion">
          <h2 className="footer__titulo-seccion">Legal</h2>
          <ul className="footer__lista">
            <li><Link to="/terminos-de-servicio"   className="footer__enlace">Términos de servicio</Link></li>
            <li><Link to="/politica-de-privacidad" className="footer__enlace">Política de privacidad</Link></li>
            <li><Link to="/cookies"                className="footer__enlace">Cookies</Link></li>
            <li><Link to="/contacto"               className="footer__enlace">Contacto</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
