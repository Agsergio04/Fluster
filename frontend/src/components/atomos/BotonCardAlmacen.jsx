const LABELS = {
  'ver-registro': 'Ver registro',
  'borrar':       'Borrar contenedor',
}

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
