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
    // Admin protegido: no se le puede quitar el rol de admin ni eliminarlo.
    // Garantiza que el administrador principal del sistema siempre permanece.
    protegido: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: false } }
)

// El índice de búsqueda por correo lo crea ya la opción `unique: true` del campo,
// por lo que no se declara aquí de nuevo (evita el índice duplicado).

module.exports = model('Usuario', usuarioSchema)
