import TramoDeFechas from './TramoDeFechas'

const formatCoste = (n) =>
  (n ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

function TarjetaCicloContenedor({
  cliente,
  demurrage,
  detention,
  onEditarDemurrage,
  onEditarDetention,
}) {
  const costeDem  = demurrage?.costeTotal ?? 0
  const costeDet  = detention?.costeTotal ?? 0
  const costeTotal = costeDem + costeDet

  return (
    <article className="tarjeta-ciclo-contenedor">
      <header className="tarjeta-ciclo-contenedor__cabecera">
        <span className="tarjeta-ciclo-contenedor__cliente">{cliente}</span>
      </header>

      <div className="tarjeta-ciclo-contenedor__seccion">
        <TramoDeFechas
          titulo="Demurrage"
          fechaInicio={demurrage?.fechaInicio}
          fechaFin={demurrage?.fechaFin}
          onEditar={onEditarDemurrage}
        />
        <p className="tarjeta-ciclo-contenedor__coste-linea">
          <span>Coste Demurrage</span>
          <span>{formatCoste(costeDem)}</span>
        </p>
      </div>

      <hr className="tarjeta-ciclo-contenedor__separador" />

      <div className="tarjeta-ciclo-contenedor__seccion">
        <TramoDeFechas
          titulo="Detention"
          fechaInicio={detention?.fechaInicio}
          fechaFin={detention?.fechaFin}
          onEditar={onEditarDetention}
        />
        <p className="tarjeta-ciclo-contenedor__coste-linea">
          <span>Coste Detention</span>
          <span>{formatCoste(costeDet)}</span>
        </p>
      </div>

      <hr className="tarjeta-ciclo-contenedor__separador" />

      <footer className="tarjeta-ciclo-contenedor__total">
        <span>Total ciclo</span>
        <span>{formatCoste(costeTotal)}</span>
      </footer>
    </article>
  )
}

export default TarjetaCicloContenedor
