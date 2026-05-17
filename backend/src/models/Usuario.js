/**
 * Modelo de Usuario
 * Representa a los usuarios del sistema con sus credenciales y rol de acceso
 */

const { Schema, model } = require('mongoose')

/**
 * Esquema de usuario
 * Gestiona el acceso al sistema mediante rol:
 *   - admin:    administra roles; debe existir al menos uno en todo momento
 *   - gestor:   gestiona tramos de contenedores y genera informes PDF
 *   - operador: da de alta contenedores y registra eventos con foto
 */
const usuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contrasena: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ['admin', 'gestor', 'operador'],
      required: true,
    },
    foto: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: false } }
)

// Índice para búsquedas por correo en login
usuarioSchema.index({ correo: 1 })

module.exports = model('Usuario', usuarioSchema)
