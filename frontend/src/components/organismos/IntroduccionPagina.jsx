import BotonIniciarSesion from '../atomos/BotonIniciarSesion'
import BotonEmpezarAhora from '../atomos/BotonEmpezarAhora'

function IntroduccionPagina({ imagenSrc = '', onIniciarSesion, onEmpezarAhora }) {
  return (
    <div className="introduccion-pagina">
      <div className="introduccion-pagina__contenido">
        <p className="introduccion-pagina__titulo">Fluster</p>
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
        {imagenSrc && (
          <img src={imagenSrc} alt="Puerto de contenedores" />
        )}
      </div>
    </div>
  )
}

export default IntroduccionPagina
