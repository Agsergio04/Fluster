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
  nombre:    'Sergio Aragón García',
  correo:    'sergioaragongarcia@gmail.com',
  contrasena: 'Sergio1234',
  rol:       'admin',
  protegido: true, // no se le puede quitar el rol de admin ni eliminarlo
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI)

  // Se busca por correo (no por rol) para garantizar que ESTE admin protegido
  // existe siempre, aunque hubiera otros administradores en el sistema.
  const yaExiste = await Usuario.findOne({ correo: ADMIN.correo })
  if (yaExiste) {
    // Idempotente: si su registro se creó antes de existir el campo `protegido`
    // (p. ej. en la base de datos de Atlas ya en producción), se repara aquí
    // para que conserve el rol admin y la protección. Sin esto, volver a sembrar
    // lo omitiría y su registro real seguiría sin el flag.
    if (yaExiste.rol !== 'admin' || yaExiste.protegido !== true) {
      yaExiste.rol = 'admin'
      yaExiste.protegido = true
      await yaExiste.save()
      console.log('Administrador protegido actualizado: rol=admin, protegido=true.')
    } else {
      console.log('El administrador protegido ya existe y está correcto.')
    }
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
