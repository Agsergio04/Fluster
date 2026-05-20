const LABELS = {
  'sin-coste':     'Tramo sin coste aplicado',
  'primer-tramo':  'Primer Tramo',
  'segundo-tramo': 'Segundo Tramo',
  'inactivo':      'Inactivos',
}

/**
 * Cabecera de sección del semáforo que muestra el tramo activo y el número de contenedores.
 * Pluraliza el contador automáticamente (1 contenedor / N contenedores).
 * El modificador BEM controla el color del badge según el tramo (verde/ámbar/rojo).
 *
 * @param {'sin-coste'|'primer-tramo'|'segundo-tramo'|'inactivo'} tramo
 * @param {number} cantidad
 */
function CabeceraTramo({ tramo = 'inactivo', cantidad = 0 }) {
  return (
    <div className={`cabecera-tramo cabecera-tramo--${tramo}`}>
      <h2 className="cabecera-tramo__label">{LABELS[tramo] ?? LABELS.inactivo}</h2>
      <div className="cabecera-tramo__badge">
        <span className="cabecera-tramo__cantidad">{cantidad} {cantidad === 1 ? 'contenedor' : 'contenedores'}</span>
      </div>
    </div>
  )
}

export default CabeceraTramo
