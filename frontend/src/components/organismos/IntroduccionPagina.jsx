import BotonIniciarSesion from '../atomos/BotonIniciarSesion'
import BotonEmpezarAhora from '../atomos/BotonEmpezarAhora'
import BotonAccionRol from '../atomos/BotonAccionRol'
import imagenHome from '../../assets/images/imagen_home.jpg'

/**
 * Hero de la página de inicio.
 * - Invitado (sin `cta`): muestra los botones de iniciar sesión y registro.
 * - Autenticado (`cta` definido): muestra un único botón de acción según el rol.
 */
function IntroduccionPagina({ onIniciarSesion, onEmpezarAhora, cta = null }) {
  return (
    <div className="introduccion-pagina">
      <div className="introduccion-pagina__contenido">
        <h1 className="introduccion-pagina__titulo">Fluster</h1>
        <p className="introduccion-pagina__descripcion">
          Tu mejor página para organizar y gestionar los costes de sobrestadía y
          detención de manera más cómoda
        </p>
        <div className="introduccion-pagina__botones">
          {cta ? (
            <BotonAccionRol label={cta.label} onClick={cta.onClick} disabled={cta.disabled} />
          ) : (
            <>
              <BotonIniciarSesion onClick={onIniciarSesion} />
              <BotonEmpezarAhora  onClick={onEmpezarAhora} />
            </>
          )}
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
