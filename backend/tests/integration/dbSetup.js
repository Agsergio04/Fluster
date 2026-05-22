/**
 * Helpers de base de datos en memoria para los tests de integración.
 * Levanta una instancia real de MongoDB (mongodb-memory-server) para que
 * las peticiones recorran el flujo completo ruta → controlador → servicio → BD.
 */

const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

async function conectar() {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
}

async function desconectar() {
  await mongoose.disconnect()
  await mongoServer.stop()
}

async function limpiar() {
  const colecciones = mongoose.connection.collections
  for (const key in colecciones) {
    await colecciones[key].deleteMany({})
  }
}

module.exports = { conectar, desconectar, limpiar }
