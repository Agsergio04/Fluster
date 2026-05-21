import axios from 'axios'
import { limpiarSesion } from './session'

/**
 * Instancia de Axios preconfigurada para todas las peticiones a la API.
 * La baseURL se puede sobrescribir por entorno mediante VITE_API_URL.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
})

// Adjunta el token JWT de la sesión en cada petición saliente.
// El token se lee directamente de sessionStorage en lugar del servicio
// para evitar dependencia circular (session.js importa apiClient).
apiClient.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Cierre de sesión global: si llega un 401 con sesión activa (token caducado
// o revocado), limpia la sesión y vuelve al home. Si no hay token es un
// intento de login fallido — el error debe llegar al componente, no redirigir.
apiClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && sessionStorage.getItem('token')) {
      limpiarSesion()
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default apiClient
