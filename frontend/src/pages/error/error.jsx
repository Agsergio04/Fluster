import './error.scss'
import useDocumentTitle from '../../hooks/useDocumentTitle'

function Error() {
  useDocumentTitle('Página no encontrada | Fluster')
  return (
    <main className="o-error">
      <h1>404</h1>
      <p>Página no encontrada</p>
    </main>
  )
}

export default Error
