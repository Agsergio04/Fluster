import { useState } from 'react'
import FilaNavieraTarifas from './FilaNavieraTarifas'
import BotonAccionTarifa from '../atomos/BotonAccionTarifa'

/**
 * Envuelve FilaNavieraTarifas añadiendo estado local de edición y los botones
 * de guardar y eliminar. El estado local evita que los cambios de una fila
 * afecten al resto mientras el usuario no pulsa "Actualizar".
 *
 * @param {string}   naviera
 * @param {Array}    valores      - Valores iniciales del servidor
 * @param {function} onActualizar - Recibe el array de valores editados
 * @param {function} onEliminar
 */
function FilaNavieraTarifasConBotones({ naviera, valores = [], onActualizar, onEliminar }) {
  // Copia local para que los cambios no escalen hasta el estado global hasta guardar
  const [valoresLocales, setValoresLocales] = useState(valores)

  const handleCeldaChange = (index, valor) =>
    setValoresLocales(prev => prev.map((v, i) => i === index ? valor : v))

  return (
    <div className="fila-naviera-con-botones">
      <FilaNavieraTarifas
        naviera={naviera}
        valores={valoresLocales}
        editable
        onCeldaChange={handleCeldaChange}
      />
      <BotonAccionTarifa accion="actualizar" onClick={() => onActualizar?.(valoresLocales)} />
      <BotonAccionTarifa accion="eliminar"   onClick={onEliminar} />
    </div>
  )
}

export default FilaNavieraTarifasConBotones
