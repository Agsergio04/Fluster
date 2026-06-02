const path = require('path')
const fs   = require('fs')
const { extraerCodigoBic } = require('./src/services/ocrService')
const BASE = path.resolve(__dirname, '../docs/assets/Contenedores')
const muestra = ['contenedor_leido_2.jpeg','contenedor_leido_4.jpeg','contenedor_leido_5.jpeg','contenedor_fallo_1.jpeg']
;(async () => {
  for (const n of muestra) {
    const b64 = fs.readFileSync(path.join(BASE, n)).toString('base64')
    const t0 = Date.now()
    try {
      const bic = await extraerCodigoBic(`data:image/jpeg;base64,${b64}`)
      console.log(`${bic ? '✓' : '·'}  ${n}  ->  "${bic}"   (${Date.now()-t0}ms)`)
    } catch (e) { console.log(`ERR ${n}  ${e.message}`) }
  }
})()
