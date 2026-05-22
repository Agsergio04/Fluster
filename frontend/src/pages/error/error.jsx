import { Link } from 'react-router-dom'
import './error.scss'
import useDocumentTitle from '../../hooks/useDocumentTitle'

function Error() {
  useDocumentTitle('Página no encontrada | Fluster')

  return (
    <main className="o-error">
      <div className="o-error__contenido">
        <span className="o-error__codigo">404</span>
        <h1 className="o-error__titulo">Página no encontrada</h1>
        <p className="o-error__descripcion">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link to="/" className="o-error__boton">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}

export default Error
