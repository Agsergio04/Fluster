import { useState } from 'react'
import CeldaTabla from '../atomos/CeldaTabla'
import BotonAccionTarifa from '../atomos/BotonAccionTarifa'

const GRUPOS = [
  { titulo: 'Duración Free Time',  det: 0, dem: 1 },
  { titulo: 'Límite Primer Tramo', det: 2, dem: 3 },
  { titulo: 'Primer Tramo',        det: 4, dem: 5 },
  { titulo: 'Segundo Tramo',       det: 6, dem: 7 },
]

function GrupoNavieraMovil({ naviera, valores = [], onActualizar, onEliminar }) {
  const [vals, setVals] = useState(valores)

  const handleChange = (index, valor) =>
    setVals(prev => prev.map((v, i) => i === index ? valor : v))

  return (
    <div className="grupo-naviera-movil">
      {GRUPOS.map(grupo => (
        <div key={grupo.titulo} className="grupo-naviera-movil__bloque">
          <div className="grupo-naviera-movil__fila">
            <div className="celda-tabla celda-tabla--grupo-titulo">
              <span className="celda-tabla__texto">{grupo.titulo}</span>
            </div>
          </div>
          <div className="grupo-naviera-movil__fila">
            <CeldaTabla label="Naviera"     tamanio="naviera" fuente="body" />
            <CeldaTabla label="Detención"   tamanio="sm"      fuente="body" />
            <CeldaTabla label="Sobrestadía" tamanio="sm"      fuente="body" />
          </div>
          <div className="grupo-naviera-movil__fila">
            <CeldaTabla label={naviera}                  tamanio="naviera" readonly />
            <CeldaTabla label={String(vals[grupo.det])}  tamanio="sm"      editable onChange={v => handleChange(grupo.det, v)} />
            <CeldaTabla label={String(vals[grupo.dem])}  tamanio="sm"      editable onChange={v => handleChange(grupo.dem, v)} />
          </div>
        </div>
      ))}

      <div className="grupo-naviera-movil__botones">
        <BotonAccionTarifa accion="actualizar" onClick={() => onActualizar?.(vals)} />
        <BotonAccionTarifa accion="eliminar"   onClick={onEliminar} />
      </div>
    </div>
  )
}

export default GrupoNavieraMovil
