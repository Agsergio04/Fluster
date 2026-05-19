/**
 * Indicador de carga accesible.
 * Implementado en CSS puro — sin dependencias externas — usando los tokens
 * del sistema de diseño para garantizar coherencia visual en toda la app.
 *
 * Se coloca dentro de botones (tamanio="sm") o como indicador de página
 * completa envuelto en un contenedor centrado (tamanio="md" / "lg").
 *
 * @param {'sm'|'md'|'lg'} tamanio
 */
function Spinner({ tamanio = 'md' }) {
  return (
    <span
      className={`spinner spinner--${tamanio}`}
      role="status"
      aria-label="Cargando"
    />
  )
}

export default Spinner
