import apiClient from './apiClient'

/**
 * Envía una imagen en base64 al servidor para extraer el código BIC
 * mediante OCR (Tesseract.js en backend).
 * Devuelve cadena vacía si el motor no detecta ningún código válido,
 * de modo que el componente puede mostrar el formulario manual sin lanzar error.
 *
 * @param {string} imagenBase64 - Data URL o base64 puro de la imagen del contenedor
 * @returns {string} Código BIC extraído, o '' si la extracción falla
 */
export async function extraerCodigoBic(imagenBase64) {
  const { data } = await apiClient.post('/ocr/extraer-bic', { imagen: imagenBase64 })
  return data.codigoBic ?? ''
}
