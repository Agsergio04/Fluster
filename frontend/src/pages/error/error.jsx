import { useNavigate } from 'react-router-dom'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import useDestinoRol from '../../hooks/useDestinoRol'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'
import './error.scss'

function Error() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario = getUsuario()
  const { destino } = useDestinoRol()
  useDocumentTitle('Página no encontrada | Fluster')

  // Con sesión, devolvemos al usuario a su área de trabajo; sin ella, a la landing.
  const rutaVolver = destino ?? '/'

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main className="o-error">
        <div className="o-error__contenido">
          <span className="o-error__codigo">404</span>
          <h1 className="o-error__titulo">Página no encontrada</h1>
          <p className="o-error__descripcion">
            La página que buscas no existe o ha sido movida.
          </p>
          <button className="o-error__boton" onClick={() => navigate(rutaVolver)}>
            {destino ? 'Volver a mi panel' : 'Volver al inicio'}
          </button>
        </div>
      </main>
    </>
  )
}

export default Error
