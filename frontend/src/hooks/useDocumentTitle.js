import { useEffect } from 'react'

/**
 * Actualiza document.title mientras el componente está montado
 * y restaura el título base al desmontar.
 *
 * @param {string} titulo - Título de la página (ej. "Perfil | Fluster")
 */
function useDocumentTitle(titulo) {
  useEffect(() => {
    const anterior = document.title
    document.title = titulo
    return () => { document.title = anterior }
  }, [titulo])
}

export default useDocumentTitle
