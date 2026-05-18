import { useState, useEffect } from 'react'

/**
 * Hook personalizado para gestionar el tema de la interfaz (claro/oscuro).
 * Lee la preferencia del sistema como valor por defecto la primera vez,
 * pero persiste la elección del usuario en localStorage para que se
 * mantenga entre sesiones.
 *
 * @returns {[string, Function]} - Tupla con el tema actual y la función toggleTema
 */
function useTema() {
  const [tema, setTema] = useState(() => {
    // Intentamos recuperar el tema guardado; si no existe, usamos la
    // preferencia del sistema operativo del usuario
    const guardado = localStorage.getItem('tema')
    if (guardado) return guardado
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    // Aplicamos el tema al elemento raíz del documento para que los
    // tokens de color CSS reaccionen a través del selector [data-theme]
    document.documentElement.setAttribute('data-theme', tema)
    localStorage.setItem('tema', tema)
  }, [tema])

  const toggleTema = () => setTema(t => t === 'light' ? 'dark' : 'light')

  return [tema, toggleTema]
}

export default useTema
