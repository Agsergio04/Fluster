import { useState, useEffect } from 'react'

function useTema() {
  const [tema, setTema] = useState(() => {
    const guardado = localStorage.getItem('tema')
    if (guardado) return guardado
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    localStorage.setItem('tema', tema)
  }, [tema])

  const toggleTema = () => setTema(t => t === 'light' ? 'dark' : 'light')

  return [tema, toggleTema]
}

export default useTema
