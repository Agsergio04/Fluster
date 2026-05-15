import { useState } from 'react'
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
          <p className="grupo-naviera-movil__titulo">{grupo.titulo}</p>
          <table className="grupo-naviera-movil__tabla">
            <thead>
              <tr>
                <th>Naviera</th>
                <th>Det.</th>
                <th>Dem.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{naviera}</td>
                <td>
                  <input
                    className="grupo-naviera-movil__input"
                    value={vals[grupo.det]}
                    onChange={e => handleChange(grupo.det, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="grupo-naviera-movil__input"
                    value={vals[grupo.dem]}
                    onChange={e => handleChange(grupo.dem, e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
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
