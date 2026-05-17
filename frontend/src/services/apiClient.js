import axios from 'axios'
import { limpiarSesion } from './session'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
})

apiClient.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      limpiarSesion()
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default apiClient
