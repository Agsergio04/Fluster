import { Component } from 'react'

/**
 * Límite de error global de la aplicación.
 *
 * React solo deja capturar errores de renderizado en componentes de clase
 * (getDerivedStateFromError / componentDidCatch), por eso este es de clase y
 * no un componente de función.
 *
 * Sin un límite como este, cualquier excepción durante el render —o un fallo al
 * descargar un chunk diferido (lazy) tras un despliegue nuevo— dejaría la
 * pantalla en blanco. Aquí se muestra un fallback con la misma identidad visual
 * y se ofrece recargar o volver al inicio.
 *
 * Usa window.location (no el router) a propósito: envuelve al propio
 * BrowserRouter, así que el fallback no puede depender de hooks de react-router.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hayError: false, esErrorDeChunk: false }
  }

  static getDerivedStateFromError(error) {
    // Los fallos al cargar un módulo diferido (típicos tras desplegar una versión
    // nueva mientras el usuario tenía la app abierta) se resuelven recargando.
    const mensaje = String(error?.message ?? '')
    const esErrorDeChunk =
      /dynamically imported module|Loading chunk|Failed to fetch/i.test(mensaje)
    return { hayError: true, esErrorDeChunk }
  }

  componentDidCatch(error, info) {
    // Sin servicio de telemetría: se deja traza en consola para depuración.
    // Aquí se integraría Sentry u otro reporter en el futuro.
    console.error('Error no controlado capturado por ErrorBoundary:', error, info)
  }

  render() {
    if (!this.state.hayError) return this.props.children

    const { esErrorDeChunk } = this.state

    return (
      <main className="o-error-boundary">
        <div className="o-error-boundary__contenido">
          <h1 className="o-error-boundary__titulo">Algo ha ido mal</h1>
          <p className="o-error-boundary__descripcion">
            {esErrorDeChunk
              ? 'La aplicación se ha actualizado. Recarga la página para continuar.'
              : 'Ha ocurrido un error inesperado. Puedes recargar la página o volver al inicio.'}
          </p>
          <div className="o-error-boundary__acciones">
            <button
              type="button"
              className="o-error-boundary__boton o-error-boundary__boton--primario"
              onClick={() => window.location.reload()}
            >
              Recargar la página
            </button>
            <button
              type="button"
              className="o-error-boundary__boton"
              onClick={() => { window.location.href = '/' }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </main>
    )
  }
}

export default ErrorBoundary
