const path = require('path')
const { createWorker } = require('tesseract.js')

const LANG_PATH = path.join(__dirname, '../..')

// Regex flexible: 3 letras + cualquier char (categoría puede venir mal leída) +
// 6 chars alfanuméricos (dígitos o letras confundidas) + 1 char final
const BIC_REGEX = /[A-Z]{3}[A-Z0-9]\s*[A-Z0-9]{6}\s*[A-Z0-9]/g

// Corrige los errores de lectura típicos de Tesseract según la posición ISO 6346:
// - pos 4  (categoría): debe ser U/J/Z — 0/O→U, V→U, I/1→J, 2→Z
// - pos 5-10 (serie):   deben ser dígitos — O→0, I/L→1, S→5, B→8, Z→2, G→6
// - pos 11 (dígito de control): igual que serie
function normalizarBic(raw) {
  const c = raw.replace(/\s/g, '').split('')
  if (c[3] === '0' || c[3] === 'O' || c[3] === 'V') c[3] = 'U'
  if (c[3] === 'I' || c[3] === '1')                  c[3] = 'J'
  if (c[3] === '2')                                   c[3] = 'Z'
  for (let i = 4; i <= 10; i++) {
    if (c[i] === 'O')             c[i] = '0'
    if (c[i] === 'I' || c[i] === 'L') c[i] = '1'
    if (c[i] === 'S')             c[i] = '5'
    if (c[i] === 'B')             c[i] = '8'
    if (c[i] === 'Z')             c[i] = '2'
    if (c[i] === 'G')             c[i] = '6'
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
