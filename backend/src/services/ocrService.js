const path = require('path')
const { createWorker } = require('tesseract.js')

const LANG_PATH = path.join(__dirname, '../..')

// 4 letras (propietario + categoría) seguidas de 6 dígitos (serie)
// No validamos qué letra es la categoría — Tesseract puede leerla mal
const BIC_REGEX = /[A-Z]{4}\s*[0-9O]{7}/g

// Corrige misreads de Tesseract en las posiciones numéricas (serie, índices 4-9)
function normalizarBic(raw) {
  const c = raw.replace(/\s/g, '').split('')
  for (let i = 4; i <= 9; i++) {
    if (c[i] === 'O')                  c[i] = '0'
    if (c[i] === 'I' || c[i] === 'L') c[i] = '1'
    if (c[i] === 'S')                  c[i] = '5'
    if (c[i] === 'B')                  c[i] = '8'
    if (c[i] === 'Z')                  c[i] = '2'
    if (c[i] === 'G')                  c[i] = '6'
  }
  return c.join('')
}

async function extraerCodigoBic(imagenBase64) {
  const base64Data = imagenBase64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  const worker = await createWorker('eng', 1, { langPath: LANG_PATH, logger: () => {} })
  try {
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      tessedit_pageseg_mode: '11',
    })
    const { data: { text } } = await worker.recognize(buffer)
    const coincidencias = text.toUpperCase().match(BIC_REGEX)
    if (coincidencias?.length) {
      return normalizarBic(coincidencias[0])
    }
    return ''
  } finally {
    await worker.terminate()
  }
}

module.exports = { extraerCodigoBic }
