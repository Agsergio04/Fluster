import { useState, useEffect } from 'react'
import { getRol } from '../services/session'
import { listarContenedores } from '../services/contenedorService'

// Mapa de aterrizaje por rol — fuente única de verdad compartida por la landing,
// los guards (/login, /registro con sesión) y la redirección tras iniciar sesión.
export const RUTA_POR_ROL = {
  admin:    '/panel-de-control',
  gestor:   '/semaforo',
  operador: '/meter-contenedor',
}

/**
 * Destino definitivo de navegación según el rol. El operador va a /contenedores
 * si ya tiene contenedores registrados, o a /meter-contenedor si no (o si la
 * consulta falla). El resto de roles tienen destino fijo.
 *
 * @param {string|null} rol
 * @returns {Promise<string>} ruta de aterrizaje
 */
export async function resolverDestinoRol(rol) {
  if (rol === 'operador') {
    try {
      const lista = await listarContenedores()
      return lista.length > 0 ? '/contenedores' : '/meter-contenedor'
    } catch {
      return '/meter-contenedor'
    }
  }
  return RUTA_POR_ROL[rol] ?? '/'
}

// Destino inicial síncrono: el operador arranca en /meter-contenedor con
// cargando=true hasta confirmar si ya tiene contenedores; el resto, destino fijo.
function destinoInicial(rol) {
  if (rol === 'operador') return { destino: RUTA_POR_ROL.operador, cargando: true }
  return { destino: RUTA_POR_ROL[rol] ?? null, cargando: false }
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
    resolverDestinoRol(rol)
      .then(destino => { if (activo) setEstado({ destino, cargando: false }) })
    return () => { activo = false }
  }, [rol])

  return estado
}

export default useDestinoRol
