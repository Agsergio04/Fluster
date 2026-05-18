function Footer() {
  return (
    <footer className="footer">
      <div className="footer__contenido">
        <p className="footer__marca">Fluster</p>
        <p className="footer__descripcion">
          Gestión de contenedores marítimos · Demurrage &amp; Detention
        </p>
      </div>
      <p className="footer__copyright">
        © {new Date().getFullYear()} Fluster. Todos los derechos reservados.
      </p>
    </footer>
  )
}

export default Footer
