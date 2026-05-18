import { useEffect } from 'react'

/**
 * Notificación flotante con auto-cierre.
 * Se auto-destruye después de `duracion` ms para no bloquear la UI.
 * El timer se cancela si el mensaje cambia antes de expirar (p. ej.
 * si llega un nuevo aviso) para reiniciar el contador correctamente.
 *
 * @param {string}   mensaje  - Texto a mostrar; si está vacío no se renderiza nada
 * @param {function} onCerrar - Callback que debe limpiar el mensaje en el padre
 * @param {number}   duracion - Milisegundos antes del cierre automático (por defecto 4000)
 */
function Notificacion({ mensaje, onCerrar, duracion = 4000 }) {
  useEffect(() => {
    if (!mensaje) return
    const timer = setTimeout(onCerrar, duracion)
    return () => clearTimeout(timer)
  }, [mensaje, duracion, onCerrar])

  if (!mensaje) return null

  return (
    <div className="notificacion" role="alert">
      <p className="notificacion__mensaje">{mensaje}</p>
      <button
        className="notificacion__cerrar"
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  )
}

export default Notificacion
