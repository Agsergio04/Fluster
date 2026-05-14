import { useEffect } from 'react'

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
