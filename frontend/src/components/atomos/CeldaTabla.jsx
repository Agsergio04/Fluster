function CeldaTabla({ label, tamanio = 'md', fuente = 'heading' }) {
  return (
    <div className={`celda-tabla celda-tabla--${tamanio}${fuente === 'body' ? ' celda-tabla--body' : ''}`}>
      <span className="celda-tabla__texto">{label}</span>
    </div>
  )
}

export default CeldaTabla
