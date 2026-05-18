const LABELS = {
  'ver-registro': 'Ver registro',
  'borrar':       'Borrar contenedor',
}

/**
 * Botón de acción en la tarjeta de almacén.
 * 'borrar' se deshabilita externamente cuando el contenedor no está INACTIVO.
 *
 * @param {'ver-registro'|'borrar'} variante
 */
function BotonCardAlmacen({ variante = 'ver-registro', onClick, disabled = false }) {
  return (
    <button
      type="button"
      className="btn-card-almacen"
      onClick={onClick}
      disabled={disabled}
    >
      {LABELS[variante]}
    </button>
  )
}

export default BotonCardAlmacen
