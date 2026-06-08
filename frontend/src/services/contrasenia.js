// Reglas de la contraseña al crear una cuenta. Centralizadas aquí para que las
// compartan la validación del formulario de registro y el checklist de
// requisitos que se muestra en vivo mientras el usuario escribe.
export const REQUISITOS_CONTRASENIA = [
  { id: 'longitud',  etiqueta: 'Al menos 12 caracteres',        cumple: v => v.length >= 12 },
  { id: 'mayuscula', etiqueta: 'Al menos una letra mayúscula',  cumple: v => /[A-Z]/.test(v) },
  { id: 'numero',    etiqueta: 'Al menos un número',            cumple: v => /[0-9]/.test(v) },
  { id: 'especial',  etiqueta: 'Al menos un carácter especial', cumple: v => /[^A-Za-z0-9]/.test(v) },
]

/** Devuelve true si la contraseña cumple todos los requisitos. */
export function contraseniaValida(valor = '') {
  return REQUISITOS_CONTRASENIA.every(r => r.cumple(valor))
}
