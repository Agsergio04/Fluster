/**
 * Limitadores de tasa (rate limiting).
 * Frenan el abuso de la API y, sobre todo, la fuerza bruta de credenciales en
 * el login. Se desactivan bajo NODE_ENV=test para no interferir con la batería
 * de tests de integración.
 */

const rateLimit = require('express-rate-limit')

const enTest = () => process.env.NODE_ENV === 'test'

// Límite general suave para toda la API: contiene escaneos y abuso sin molestar
// al uso normal de la aplicación.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: enTest,
  message: { mensaje: 'Demasiadas peticiones; inténtalo de nuevo más tarde' },
})

// Límite estricto para autenticación: frena la fuerza bruta de contraseñas y el
// abuso del registro. Solo cuentan los intentos fallidos (skipSuccessfulRequests),
// de modo que un usuario legítimo que acierta no se ve afectado.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: enTest,
  message: { mensaje: 'Demasiados intentos; espera unos minutos e inténtalo de nuevo' },
})

module.exports = { generalLimiter, authLimiter }
