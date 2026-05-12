import FilaNavieraTarifas from './FilaNavieraTarifas'
import BotonAccionTarifa from '../atomos/BotonAccionTarifa'

function FilaNavieraTarifasConBotones({ naviera, valores = [], onActualizar, onEliminar }) {
  return (
    <div className="fila-naviera-con-botones">
      <FilaNavieraTarifas naviera={naviera} valores={valores} />
      <BotonAccionTarifa accion="actualizar" onClick={onActualizar} />
      <BotonAccionTarifa accion="eliminar"   onClick={onEliminar} />
    </div>
  )
}

export default FilaNavieraTarifasConBotones
