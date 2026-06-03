import BotonRol      from '../atomos/BotonRol'
import OperadorIcon from '../../assets/icons/Icono Operador.svg?react'
import GestorIcon   from '../../assets/icons/Icono Gestor.svg?react'

/**
 * Par de botones de selección de rol para el formulario de registro.
 * Cada botón alterna entre seleccionado y deseleccionado: pulsar el rol
 * ya activo lo deselecciona (devuelve null al padre). El otro botón
 * recibe la prop `off` para atenuarse visualmente sin bloquearse.
 *
 * @param {'operador'|'gestor'|null} rolSeleccionado
 * @param {function} onSeleccionarRol - Recibe el nuevo rol o null si se deselecciona
 */
function BotonesSeleccionRol({ rolSeleccionado, onSeleccionarRol }) {
  return (
    <div className="botones-seleccion-rol">
      <BotonRol
        icon={<OperadorIcon aria-hidden="true" />}
        titulo="Soy un operador"
        descripcion="Introduzco contenedores mediante un sistema OCR"
        active={rolSeleccionado === 'operador'}
        off={rolSeleccionado === 'gestor'}
        onClick={() => onSeleccionarRol?.(rolSeleccionado === 'operador' ? null : 'operador')}
      />
      <BotonRol
        icon={<GestorIcon aria-hidden="true" />}
        titulo="Soy gestor de operaciones"
        descripcion="Controlo tarifas de navieras, gestiono los contenedores y genero los informes"
        active={rolSeleccionado === 'gestor'}
        off={rolSeleccionado === 'operador'}
        onClick={() => onSeleccionarRol?.(rolSeleccionado === 'gestor' ? null : 'gestor')}
      />
    </div>
  )
}

export default BotonesSeleccionRol
