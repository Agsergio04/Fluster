const path = require('path')
const fs   = require('fs')
const { extraerCodigoBic } = require('./src/services/ocrService')

const BASE     = path.resolve(__dirname, '../docs/assets/Contenedores')
const destino  = path.join(BASE, 'ResultadosOCR')

// Recoge todos los JPEG/PNG de la carpeta raíz y sus subcarpetas,
// excluyendo la propia carpeta de resultados para no reprocesar
function recogerImagenes(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let imagenes = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (full !== destino) imagenes = imagenes.concat(recogerImagenes(full))
    } else if (/\.(jpe?g|png)$/i.test(e.name)) {
      imagenes.push(full)
    }
  }
  return imagenes
}

const files = recogerImagenes(BASE)

if (!fs.existsSync(destino)) fs.mkdirSync(destino, { recursive: true })

console.log(`Procesando ${files.length} imagenes...\n`)

async function run() {
  let okCount   = 0
  let failCount = 0

  for (const full of files) {
    const ext  = path.extname(full).toLowerCase()
    const mime = (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : `image/${ext.slice(1)}`
    const b64  = fs.readFileSync(full).toString('base64')
    const url  = `data:${mime};base64,${b64}`

    try {
      const bic = await extraerCodigoBic(url)
      if (bic) {
        okCount++
        const nombre = `contenedor_${bic}${ext}`
        fs.copyFileSync(full, path.join(destino, nombre))
        console.log(`✓  ${nombre}`)
      } else {
        failCount++
        const nombre = `contenedor_fallo_${failCount}${ext}`
        fs.copyFileSync(full, path.join(destino, nombre))
        console.log(`✗  ${nombre}`)
      }
    } catch (err) {
      failCount++
      const nombre = `contenedor_fallo_${failCount}${ext}`
      fs.copyFileSync(full, path.join(destino, nombre))
      console.log(`ERR ${nombre}  (${err.message})`)
    }
  }

  console.log(`\nDetectadas: ${okCount} | Fallos: ${failCount} | Total: ${files.length}`)
  console.log(`Resultados en: ${destino}`)
}

run()
