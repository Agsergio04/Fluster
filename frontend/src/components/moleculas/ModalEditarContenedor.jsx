import { useState, useRef } from 'react'

// Formato BIC/ISO 6346: 4 letras seguidas de 7 números (exactamente 11 caracteres).
const BIC_REGEX = /^[A-Za-z]{4}[0-9]{7}$/

/**
 * Modal para editar la foto, el código BIC y la fecha de inclusión de un contenedor.
 * La foto se lee como data URL para previsualizarla antes de enviarla al servidor.
 * El input file se limpia tras la selección para permitir elegir el mismo fichero
 * dos veces seguidas (el navegador no dispara onChange si el valor no cambia).
 *
 * @param {object}   item          - Datos actuales del contenedor (id, foto, codigoBic, fechaInicioLibre)
 * @param {function} onActualizar  - Recibe (id, { codigoBIC, foto, fechaInicioLibre })
 * @param {function} onCancelar
 */
function ModalEditarContenedor({ item, onActualizar, onCancelar }) {
  const inputFotoRef = useRef(null)

  const [foto,             setFoto]             = useState(item.foto ?? null)
  const [codigoBic,        setCodigoBic]        = useState(item.codigoBic ?? '')
  // El input[type=date] necesita formato YYYY-MM-DD; ISO incluye la hora que hay que recortar
  const [fechaInicioLibre, setFechaInicioLibre] = useState(
    item.fechaInicioLibre
      ? new Date(item.fechaInicioLibre).toISOString().split('T')[0]
      : ''
  )
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState('')

  // Fecha máxima seleccionable = hoy (en hora local). El backend rechaza las
  // fechas futuras con un 422, así que el selector ni siquiera las ofrece.
  const ahora = new Date()
  const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`

  const handleFotoElegida = e => {
    const fichero = e.target.files?.[0]
    if (!fichero) return
    // Limpiar el valor del input para que pueda re-seleccionarse el mismo fichero
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = () => setFoto(reader.result)
    reader.readAsDataURL(fichero)
  }

  const handleActualizar = async () => {
    setError('')
    const bic = codigoBic.trim().toUpperCase()
    // Solo se permite actualizar si el BIC tiene 4 letras seguidas de 7 números
    // (exactamente 11 caracteres). El backend aplica la misma regla con un 422.
    if (bic && !BIC_REGEX.test(bic)) {
      setError('El código BIC debe tener 4 letras seguidas de 7 números (11 caracteres).')
      return
    }
    setCargando(true)
    try {
      await onActualizar(item.id, {
        codigoBIC:        bic || undefined,
        foto,
        fechaInicioLibre: fechaInicioLibre ? new Date(fechaInicioLibre).toISOString() : undefined,
      })
    } catch (err) {
      setError(err.response?.data?.mensaje ?? 'Error al actualizar el contenedor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="modal-editar-contenedor" onClick={onCancelar}>
      <div
        className="modal-editar-contenedor__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Editar contenedor"
        onClick={e => e.stopPropagation()}
      >

        <div className="modal-editar-contenedor__foto-wrapper">
          {foto
            ? <img className="modal-editar-contenedor__foto" src={foto} alt="Foto del contenedor" loading="lazy" decoding="async" />
            : <div className="modal-editar-contenedor__foto-placeholder">Sin foto</div>
          }
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            aria-label="Cambiar foto del contenedor"
            aria-hidden="true"
            style={{ display: 'none' }}
            onChange={handleFotoElegida}
          />
          <button
            type="button"
            className="modal-editar-contenedor__btn-foto"
            onClick={() => inputFotoRef.current?.click()}
          >
            Cambiar foto
          </button>
        </div>

        <div className="modal-editar-contenedor__campo">
          <label className="modal-editar-contenedor__label" htmlFor="modal-editar-bic">Código BIC</label>
          <input
            id="modal-editar-bic"
            type="text"
            className="modal-editar-contenedor__fecha-input"
            value={codigoBic}
            onChange={e => setCodigoBic(e.target.value)}
            maxLength={11}
            placeholder="BLKU2580360"
          />
        </div>

        <div className="modal-editar-contenedor__campo">
          <label className="modal-editar-contenedor__label" htmlFor="modal-editar-fecha">Fecha de inclusión</label>
          <input
            id="modal-editar-fecha"
            type="date"
            className="modal-editar-contenedor__fecha-input"
            value={fechaInicioLibre}
            max={hoy}
            onChange={e => setFechaInicioLibre(e.target.value)}
          />
        </div>

        {error && <p className="modal-editar-contenedor__error">{error}</p>}

        <div className="modal-editar-contenedor__botones">
          <button
            type="button"
            className="modal-editar-contenedor__btn-actualizar"
            onClick={handleActualizar}
            disabled={cargando}
          >
            {cargando ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            type="button"
            className="modal-editar-contenedor__btn-cancelar"
            onClick={onCancelar}
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  )
}

export default ModalEditarContenedor
