import { useState, useEffect } from 'react'
import { getRol } from '../services/session'
import { listarContenedores } from '../services/contenedorService'

// Destino inicial síncrono según el rol. El operador arranca en /meter-contenedor
// (coincide con el texto del botón) y cargando=true hasta confirmar si ya tiene
// contenedores; el resto de roles tienen destino fijo y cargando=false.
function destinoInicial(rol) {
  if (rol === 'admin')    return { destino: '/panel-de-control', cargando: false }
  if (rol === 'gestor')   return { destino: '/semaforo',         cargando: false }
  if (rol === 'operador') return { destino: '/meter-contenedor', cargando: true }
  return { destino: null, cargando: false }
}

/**
 * Destino de navegación según el rol del usuario en sesión. Es el mismo que abre
 * el botón de acción de la landing y al que redirigen /login y /registro cuando
 * ya hay sesión activa:
 *   admin    → /panel-de-control
 *   gestor   → /semaforo
 *   operador → /contenedores si ya tiene contenedores, o /meter-contenedor si no
 *
 * @returns {{ destino: string|null, cargando: boolean }} destino es null sin
 *   sesión; cargando es true solo mientras se resuelve el chequeo del operador.
 */
function useDestinoRol() {
  const rol = getRol()
  const [estado, setEstado] = useState(() => destinoInicial(rol))

  useEffect(() => {
    if (rol !== 'operador') return
    let activo = true
    listarContenedores()
      .then(lista => {
        if (activo) setEstado({ destino: lista.length > 0 ? '/contenedores' : '/meter-contenedor', cargando: false })
      })
      .catch(() => { if (activo) setEstado({ destino: '/meter-contenedor', cargando: false }) })
    return () => { activo = false }
  }, [rol])

  return estado
}

export default useDestinoRol
