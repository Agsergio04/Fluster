/**
 * Script de inicialización
 * Crea el primer usuario administrador si no existe ninguno.
 * Ejecutar una sola vez antes de arrancar el sistema por primera vez:
 *
 *   node src/scripts/crearAdmin.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Usuario = require('../models/Usuario')

const ADMIN = {
  nombre:    'Administrador',
  correo:    'admin@fluster.com',
  contrasena: 'Admin1234',
  rol:       'admin',
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI)

  const yaExiste = await Usuario.findOne({ rol: 'admin' })
  if (yaExiste) {
    console.log('Ya existe un administrador. No se ha creado ninguno nuevo.')
    await mongoose.disconnect()
    return
  }

  const hash = await bcrypt.hash(ADMIN.contrasena, 10)
  await Usuario.create({ ...ADMIN, contrasena: hash })

  console.log('Administrador creado:')
  console.log(`  Correo:     ${ADMIN.correo}`)
  console.log(`  Contraseña: ${ADMIN.contrasena}`)
  console.log('Cambia la contraseña en el primer inicio de sesión.')

  await mongoose.disconnect()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
