require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt   = require('bcrypt')
const Usuario  = require('./src/models/Usuario')

const SALT = 10

const usuarios = [
  { nombre: 'Admin',           correo: 'admin@fluster.com',    contrasena: 'admin1234',    rol: 'admin'    },
  { nombre: 'Gestor Uno',      correo: 'gestor1@fluster.com',  contrasena: 'gestor1234',   rol: 'gestor'   },
  { nombre: 'Gestor Dos',      correo: 'gestor2@fluster.com',  contrasena: 'gestor1234',   rol: 'gestor'   },
  { nombre: 'Operador Uno',    correo: 'operador1@fluster.com', contrasena: 'operador1234', rol: 'operador' },
  { nombre: 'Operador Dos',    correo: 'operador2@fluster.com', contrasena: 'operador1234', rol: 'operador' },
  { nombre: 'Operador Tres',   correo: 'operador3@fluster.com', contrasena: 'operador1234', rol: 'operador' },
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Conectado a MongoDB\n')

  for (const u of usuarios) {
    const existe = await Usuario.findOne({ correo: u.correo })
    if (existe) {
      console.log(`⚠  Ya existe: ${u.correo} (omitido)`)
      continue
    }
    const hash = await bcrypt.hash(u.contrasena, SALT)
    await Usuario.create({ ...u, contrasena: hash })
    console.log(`✓  Creado [${u.rol.padEnd(8)}]  ${u.correo}  /  ${u.contrasena}`)
  }

  console.log('\nSeed completado.')
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
