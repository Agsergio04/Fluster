import { useState } from 'react'
import FilaNavieraTarifas from './FilaNavieraTarifas'
import BotonAccionTarifa from '../atomos/BotonAccionTarifa'

function FilaNavieraTarifasConBotones({ naviera, valores = [], onActualizar, onEliminar }) {
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
