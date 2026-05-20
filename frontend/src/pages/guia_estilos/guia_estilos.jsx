import { useNavigate } from 'react-router-dom'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'

function GuiaEstilos() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario = getUsuario()

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main className="pagina-estatica">
        <section className="pagina-estatica__intro">
          <h1 className="pagina-estatica__titulo">Guía de Estilos</h1>
          <p className="pagina-estatica__subtitulo">
            Sistema de diseño de Fluster. Colores, tipografía y espaciado que
            definen la identidad visual de la plataforma.
          </p>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Colores principales</h2>
          <div className="pagina-estatica__paleta">
            <div className="pagina-estatica__color">
              <div className="pagina-estatica__color-muestra" style={{ backgroundColor: 'var(--color-primary)' }} />
              <span className="pagina-estatica__color-nombre">Primary</span>
            </div>
            <div className="pagina-estatica__color">
              <div className="pagina-estatica__color-muestra" style={{ backgroundColor: 'var(--color-secondary)' }} />
              <span className="pagina-estatica__color-nombre">Secondary</span>
            </div>
            <div className="pagina-estatica__color">
              <div className="pagina-estatica__color-muestra" style={{ backgroundColor: 'var(--color-bg)' }} />
              <span className="pagina-estatica__color-nombre">Background</span>
            </div>
            <div className="pagina-estatica__color">
              <div className="pagina-estatica__color-muestra" style={{ backgroundColor: 'var(--color-surface)' }} />
              <span className="pagina-estatica__color-nombre">Surface</span>
            </div>
            <div className="pagina-estatica__color">
              <div className="pagina-estatica__color-muestra" style={{ backgroundColor: 'var(--color-sin_costes)' }} />
              <span className="pagina-estatica__color-nombre">Sin coste</span>
            </div>
            <div className="pagina-estatica__color">
              <div className="pagina-estatica__color-muestra" style={{ backgroundColor: 'var(--color-primer_tramo)' }} />
              <span className="pagina-estatica__color-nombre">Primer tramo</span>
            </div>
            <div className="pagina-estatica__color">
              <div className="pagina-estatica__color-muestra" style={{ backgroundColor: 'var(--color-segundo_tramo)' }} />
              <span className="pagina-estatica__color-nombre">Segundo tramo</span>
            </div>
            <div className="pagina-estatica__color">
              <div className="pagina-estatica__color-muestra" style={{ backgroundColor: 'var(--color-inactivo)' }} />
              <span className="pagina-estatica__color-nombre">Inactivo</span>
            </div>
          </div>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Tipografía</h2>
          <div className="pagina-estatica__tipografias">
            <div className="pagina-estatica__tipo-ejemplo">
              <span className="pagina-estatica__tipo-label">64px</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-64)', color: 'var(--color-box-text)', lineHeight: 1 }}>Fluster</span>
            </div>
            <div className="pagina-estatica__tipo-ejemplo">
              <span className="pagina-estatica__tipo-label">48px</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-48)', color: 'var(--color-box-text)', lineHeight: 1 }}>Fluster</span>
            </div>
            <div className="pagina-estatica__tipo-ejemplo">
              <span className="pagina-estatica__tipo-label">32px</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-32)', color: 'var(--color-box-text)', lineHeight: 1 }}>Fluster</span>
            </div>
            <div className="pagina-estatica__tipo-ejemplo">
              <span className="pagina-estatica__tipo-label">24px</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-24)', color: 'var(--color-box-text)', lineHeight: 1 }}>Texto de cuerpo</span>
            </div>
            <div className="pagina-estatica__tipo-ejemplo">
              <span className="pagina-estatica__tipo-label">16px</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-16)', color: 'var(--color-box-text)', lineHeight: 1 }}>Texto de cuerpo</span>
            </div>
          </div>
        </section>

        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Metodología</h2>
          <p className="pagina-estatica__seccion-texto">
            Fluster aplica <strong>ITCSS</strong> (Inverted Triangle CSS) para organizar los estilos
            en 7 capas de especificidad creciente: Settings, Tools, Generic, Elements,
            Layout, Components y Utilities. Los componentes siguen <strong>Atomic Design</strong>,
            divididos en átomos, moléculas y organismos.
          </p>
          <ul className="pagina-estatica__lista">
            <li>Nomenclatura BEM en todos los componentes</li>
            <li>Variables CSS para soporte de tema claro y oscuro</li>
            <li>Escala de espaciado base 8px</li>
            <li>Escala tipográfica base 8px</li>
            <li>Radio de borde unificado mediante <code>--radius</code></li>
          </ul>
        </section>
      </main>
    </>
  )
}

export default GuiaEstilos
