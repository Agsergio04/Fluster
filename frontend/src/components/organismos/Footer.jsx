import { Link } from 'react-router-dom'
import LogoIcono from '../../assets/images/Fluster logo sin letras.png'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__columna footer__columna--marca">
        <div className="footer__logo-grupo">
          <img src={LogoIcono} alt="Fluster" className="footer__logo" />
          <span className="footer__nombre">Fluster</span>
        </div>
        <p className="footer__descripcion">
          Gestión de contenedores marítimos.<br />
          Demurrage &amp; Detention.
        </p>
      </div>

      <div className="footer__columna">
        <h3 className="footer__titulo-seccion">Enlaces referentes</h3>
        <ul className="footer__lista">
          <li><Link to="/guia-estilos" className="footer__enlace">Guía de Estilos</Link></li>
        </ul>
      </div>

      <div className="footer__columna">
        <h3 className="footer__titulo-seccion">Legal</h3>
        <ul className="footer__lista">
          <li><Link to="/terminos-de-servicio"   className="footer__enlace">Términos de Servicio</Link></li>
          <li><Link to="/politica-de-privacidad" className="footer__enlace">Política de Privacidad</Link></li>
          <li><Link to="/cookies"                className="footer__enlace">Cookies</Link></li>
          <li><Link to="/contacto"               className="footer__enlace">Contacto</Link></li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
