const { createWorker } = require('tesseract.js')

// ISO 6346: 3 owner letters + category (U/J/Z) + 6 digits + check digit
const BIC_REGEX = /[A-Z]{3}[UJZ]\s*\d{6}\s*[\dA-Z]/g

async function extraerCodigoBic(imagenBase64) {
  const base64Data = imagenBase64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  const worker = await createWorker('eng', 1, { logger: () => {} })
  try {
    const { data: { text } } = await worker.recognize(buffer)
    const coincidencias = text.toUpperCase().match(BIC_REGEX)
    if (coincidencias?.length) {
      return coincidencias[0].replace(/\s/g, '')
    }
    return ''
  } finally {
    await worker.terminate()
  }
}

module.exports = { extraerCodigoBic }
