import BotonIniciarSesion from '../atomos/BotonIniciarSesion'
import BotonEmpezarAhora from '../atomos/BotonEmpezarAhora'
import imagenHome from '../../assets/images/imagen_home.png'

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
        <img src={imagenHome} alt="Puerto de contenedores" />
      </div>
    </div>
  )
}

export default IntroduccionPagina
