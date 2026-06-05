import { REQUISITOS_CONTRASENIA } from '../../services/contrasenia'

/**
 * Lista de requisitos de la contraseña que se marca en vivo según lo que el
 * usuario va escribiendo, para indicarle qué debe cumplir y qué le falta.
 *
 * @param {string} valor - Contraseña actual sobre la que se comprueban las reglas
 */
function RequisitosContrasenia({ valor = '' }) {
  return (
    <ul className="requisitos-contrasenia" aria-label="Requisitos de la contraseña">
      {REQUISITOS_CONTRASENIA.map(({ id, etiqueta, cumple }) => {
        const ok = cumple(valor)
        return (
          <li
            key={id}
            className={`requisitos-contrasenia__item${ok ? ' requisitos-contrasenia__item--ok' : ''}`}
          >
            <span className="requisitos-contrasenia__icono" aria-hidden="true">{ok ? '✓' : '○'}</span>
            <span>{etiqueta}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default RequisitosContrasenia
