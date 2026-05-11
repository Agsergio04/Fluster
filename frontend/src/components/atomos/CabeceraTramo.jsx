const LABELS = {
  'sin-coste':     'Tramo sin coste aplicado',
  'primer-tramo':  'Primer Tramo',
  'segundo-tramo': 'Segundo Tramo',
  'inactivo':      'Inactivos',
}

function CabeceraTramo({ tramo = 'inactivo', cantidad = 0 }) {
  return (
    <div className={`cabecera-tramo cabecera-tramo--${tramo}`}>
      <p className="cabecera-tramo__label">{LABELS[tramo] ?? LABELS.inactivo}</p>
      <div className="cabecera-tramo__badge">
        <p className="cabecera-tramo__cantidad">{cantidad} contenedores</p>
      </div>
    </div>
  )
}

export default CabeceraTramo
