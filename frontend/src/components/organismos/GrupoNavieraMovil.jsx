import { useState } from 'react'
import CeldaTabla from '../atomos/CeldaTabla'
import BotonAccionTarifa from '../atomos/BotonAccionTarifa'
import BarcoIcon from '../../assets/icons/Icono de puerto.svg?react'

/**
 * Celda editable con su etiqueta corta encima (Det./Sob.).
 * Se declara a nivel de módulo —no dentro del render— para que su tipo sea
 * estable y CeldaTabla no se vuelva a montar (perdiendo el foco) en cada pulsación.
 */
function CeldaMini({ label, valor, ariaLabel, onChange }) {
  return (
    <div className="tarjeta-tarifa__mini">
      <span className="tarjeta-tarifa__mini-label">{label}</span>
      <CeldaTabla
        label={String(valor)}
        ariaLabel={ariaLabel}
        tamanio="sm"
        fuente="body"
        editable
        onChange={onChange}
      />
    </div>
  )
}

/**
 * Tarjeta de tarifa de una naviera en formato compacto (móvil/tablet).
 * Cabecera con el código de la naviera y el cuerpo en dos columnas:
 *   - "Días":   free time y límite del primer tramo.
 *   - "Costes": tarifa €/día del primer (azul) y segundo (rojo) tramo.
 * Cada bloque desglosa detención (Det.) y sobrestadía (Sob.).
 *
 * Los ocho valores se editan en línea (reutiliza CeldaTabla) y "Actualizar"
 * envía el array completo.
 *
 * Orden de `valores`: [freeDet, freeSob, limDet, limSob,
 *                      tr1Det, tr1Sob, tr2Det, tr2Sob].
 */
function GrupoNavieraMovil({ naviera, valores = [], onActualizar, onEliminar }) {
  const [vals, setVals] = useState(valores)

  const set = (index, valor) =>
    setVals(prev => prev.map((v, i) => i === index ? valor : v))

  return (
    <div className="tarjeta-tarifa">
      <header className="tarjeta-tarifa__cabecera">
        <span className="tarjeta-tarifa__naviera">
          <BarcoIcon className="tarjeta-tarifa__icono" aria-hidden="true" />
          {naviera}
        </span>
      </header>

      <div className="tarjeta-tarifa__cuerpo">

        {/* Columna de días */}
        <section className="tarjeta-tarifa__columna">
          <h4 className="tarjeta-tarifa__columna-titulo">Días</h4>

          <div className="tarjeta-tarifa__bloque">
            <span className="tarjeta-tarifa__bloque-titulo">Free Time</span>
            <div className="tarjeta-tarifa__detsob">
              <CeldaMini label="Det." valor={vals[0]} ariaLabel="Free time detención"   onChange={v => set(0, v)} />
              <CeldaMini label="Sob." valor={vals[1]} ariaLabel="Free time sobrestadía" onChange={v => set(1, v)} />
            </div>
          </div>

          <div className="tarjeta-tarifa__bloque">
            <span className="tarjeta-tarifa__bloque-titulo">Duración Primer Tramo</span>
            <div className="tarjeta-tarifa__detsob">
              <CeldaMini label="Det." valor={vals[2]} ariaLabel="Límite primer tramo detención"   onChange={v => set(2, v)} />
              <CeldaMini label="Sob." valor={vals[3]} ariaLabel="Límite primer tramo sobrestadía" onChange={v => set(3, v)} />
            </div>
          </div>
        </section>

        {/* Columna de costes */}
        <section className="tarjeta-tarifa__columna">
          <h4 className="tarjeta-tarifa__columna-titulo">Costes (€/día)</h4>

          <div className="tarjeta-tarifa__bloque tarjeta-tarifa__bloque--primer">
            <span className="tarjeta-tarifa__bloque-titulo">Primer tramo</span>
            <div className="tarjeta-tarifa__detsob">
              <CeldaMini label="Det." valor={vals[4]} ariaLabel="Tarifa primer tramo detención"   onChange={v => set(4, v)} />
              <CeldaMini label="Sob." valor={vals[5]} ariaLabel="Tarifa primer tramo sobrestadía" onChange={v => set(5, v)} />
            </div>
          </div>

          <div className="tarjeta-tarifa__bloque tarjeta-tarifa__bloque--segundo">
            <span className="tarjeta-tarifa__bloque-titulo">Segundo tramo</span>
            <div className="tarjeta-tarifa__detsob">
              <CeldaMini label="Det." valor={vals[6]} ariaLabel="Tarifa segundo tramo detención"   onChange={v => set(6, v)} />
              <CeldaMini label="Sob." valor={vals[7]} ariaLabel="Tarifa segundo tramo sobrestadía" onChange={v => set(7, v)} />
            </div>
          </div>
        </section>

      </div>

      <div className="tarjeta-tarifa__acciones">
        <BotonAccionTarifa accion="actualizar" onClick={() => onActualizar?.(vals)} />
        <BotonAccionTarifa accion="eliminar"   onClick={onEliminar} />
      </div>

    </div>
  )
}

export default GrupoNavieraMovil
