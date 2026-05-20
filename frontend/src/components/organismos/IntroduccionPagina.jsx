import BotonIniciarSesion from '../atomos/BotonIniciarSesion'
import BotonEmpezarAhora from '../atomos/BotonEmpezarAhora'
import imagenHome from '../../assets/images/imagen_home.jpg'

function IntroduccionPagina({ onIniciarSesion, onEmpezarAhora }) {
  return (
    <div className="introduccion-pagina">
      <div className="introduccion-pagina__contenido">
        <h1 className="introduccion-pagina__titulo">Fluster</h1>
        <p className="introduccion-pagina__descripcion">
          Tu mejor pagina para organizar y gestionar los costes de sobrestadía y
          detencion de manera mas comoda
        </p>
        <div className="introduccion-pagina__botones">
          <BotonIniciarSesion onClick={onIniciarSesion} />
          <BotonEmpezarAhora  onClick={onEmpezarAhora} />
        </div>
      </div>

      <div className="introduccion-pagina__imagen">
        <picture>
          {/* ≥768 px: imagen a la mitad del viewport */}
          <source
            media="(min-width: 768px)"
            srcSet={imagenHome}
            sizes="(min-width: 1200px) 600px, 50vw"
          />
          {/* <768 px: imagen a ancho completo en layout apilado */}
          <img
            src={imagenHome}
            alt="Puerto de contenedores"
            width="600"
            height="400"
            loading="eager"
            sizes="100vw"
          />
        </picture>
      </div>
    </div>
  )
}

export default IntroduccionPagina
