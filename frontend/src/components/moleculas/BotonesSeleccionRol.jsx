import BotonRol      from '../atomos/BotonRol'
import OperadorIcon from '../../assets/icons/Icono Operador.svg?react'
import GestorIcon   from '../../assets/icons/Icono Gestor.svg?react'

function BotonesSeleccionRol({ rolSeleccionado, onSeleccionarRol }) {
  return (
    <div className="botones-seleccion-rol">
      <BotonRol
        icon={<OperadorIcon aria-hidden="true" />}
        titulo="Soy un Operador"
        descripcion="Introduzco contenedores mediante un sistema OCR"
        active={rolSeleccionado === 'operador'}
        off={rolSeleccionado === 'gestor'}
        onClick={() => onSeleccionarRol?.(rolSeleccionado === 'operador' ? null : 'operador')}
      />
      <BotonRol
        icon={<GestorIcon aria-hidden="true" />}
        titulo="Soy Gestor de Operaciones"
        descripcion="Controlo tarifas de navieras, gestiono los contenedores y genero los informes"
        active={rolSeleccionado === 'gestor'}
        off={rolSeleccionado === 'operador'}
        onClick={() => onSeleccionarRol?.(rolSeleccionado === 'gestor' ? null : 'gestor')}
      />
    </div>
  )
}

export default BotonesSeleccionRol
