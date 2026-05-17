import apiClient from './apiClient'

export async function extraerCodigoBic(imagenBase64) {
  const { data } = await apiClient.post('/ocr/extraer-bic', { imagen: imagenBase64 })
  return data.codigoBic ?? ''
}
