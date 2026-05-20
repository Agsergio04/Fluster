import { Link } from 'react-router-dom'
import LogoConLetras from '../../assets/images/Fluster logo con letras.png'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__marca">
        <img
          src={LogoConLetras}
          alt="Fluster"
          className="footer__logo"
          width="120"
          height="40"
          decoding="async"
        />
      </div>

      <div className="footer__secciones">
        <div className="footer__seccion">
          <h2 className="footer__titulo-seccion">Enlaces referentes</h2>
          <ul className="footer__lista">
            <li><Link to="/guia-estilos" className="footer__enlace">Guía de Estilos</Link></li>
          </ul>
        </div>
        <div className="footer__seccion">
          <h2 className="footer__titulo-seccion">Legal</h2>
          <ul className="footer__lista">
            <li><Link to="/terminos-de-servicio"   className="footer__enlace">Términos de Servicio</Link></li>
            <li><Link to="/politica-de-privacidad" className="footer__enlace">Política de Privacidad</Link></li>
            <li><Link to="/cookies"                className="footer__enlace">Cookies</Link></li>
            <li><Link to="/contacto"               className="footer__enlace">Contacto</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
