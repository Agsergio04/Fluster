import apiClient from './apiClient'

/**
 * Devuelve los contenedores activos agrupados por naviera/cliente,
 * con el estado de semáforo (verde/ámbar/rojo) calculado en servidor
 * según los días libres consumidos.
 */
export async function obtenerAgrupados() {
  const { data } = await apiClient.get('/semaforo')
  return data
}
