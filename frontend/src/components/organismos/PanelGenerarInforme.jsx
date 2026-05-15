import OpcionFiltro from '../moleculas/OpcionFiltro'
import BotonGenerarInforme from '../atomos/BotonGenerarInforme'

function PanelGenerarInforme({
  variante = 'general',
  fechaDesde = '',       onFechaDesde,
  fechaHasta = '',       onFechaHasta,
  fechaEspecifica = '',  onFechaEspecifica,
  naviera = '',          onNaviera,
  cliente = '',          onCliente,
  codigoBic = '',        onCodigoBic,
  orden = '',            onOrden,
  ordenAlfabetico = false,   onOrdenAlfabetico,
  onGenerarInforme,
}) {
  const esIndividual = variante === 'individual'

  const seccionFechas = (
    <div className="panel-generar-informe__columna-fechas">
      <p className="panel-generar-informe__seccion-titulo">Rango entre fechas</p>

      <div className="panel-generar-informe__rango">
        <div className="panel-generar-informe__campo-fecha">
          <p className="panel-generar-informe__campo-titulo">Desde</p>
          <input
            className="panel-generar-informe__input"
            type="date"
            value={fechaDesde}
            onChange={onFechaDesde}
            placeholder="dd/mm/yyyy"
          />
        </div>
        <div className="panel-generar-informe__campo-fecha">
          <p className="panel-generar-informe__campo-titulo">Hasta</p>
          <input
            className="panel-generar-informe__input"
            type="date"
            value={fechaHasta}
            onChange={onFechaHasta}
            placeholder="dd/mm/yyyy"
          />
        </div>
      </div>

      <div className="panel-generar-informe__campo-unico">
        <p className="panel-generar-informe__campo-label">Filtrado por fecha en especifico</p>
        <input
          className="panel-generar-informe__input"
          type="date"
          value={fechaEspecifica}
          onChange={onFechaEspecifica}
          placeholder="Introduce la fecha"
        />
      </div>
    </div>
  )

  return (
    <div className={`panel-generar-informe${esIndividual ? ' panel-generar-informe--individual' : ''}`}>

      <div className="panel-generar-informe__filtros">
        {seccionFechas}

        {!esIndividual && (
          <div className="panel-generar-informe__columna-textos">
            <div className="panel-generar-informe__campo-unico">
              <p className="panel-generar-informe__campo-label">Filtrado por el nombre del cliente</p>
              <input className="panel-generar-informe__input" type="text" value={cliente} onChange={onCliente} placeholder="Introduce por nombre del cliente" />
            </div>
            <div className="panel-generar-informe__campo-unico">
              <p className="panel-generar-informe__campo-label">Filtrado por la naviera</p>
              <input className="panel-generar-informe__input" type="text" value={naviera} onChange={onNaviera} placeholder="Introduce la naviera" />
            </div>
            <div className="panel-generar-informe__campo-unico">
              <p className="panel-generar-informe__campo-label">Filtrado por el codigo Bic</p>
              <input className="panel-generar-informe__input" type="text" value={codigoBic} onChange={onCodigoBic} placeholder="Introduce el codigo Bic" />
            </div>
          </div>
        )}

        {esIndividual && (
          <>
            <div className="panel-generar-informe__campo-unico">
              <p className="panel-generar-informe__campo-label">Filtrado por la naviera</p>
              <input className="panel-generar-informe__input" type="text" value={naviera} onChange={onNaviera} placeholder="Introduce la naviera" />
            </div>
            <div className="panel-generar-informe__campo-unico">
              <p className="panel-generar-informe__campo-label">Filtrado por el nombre del cliente</p>
              <input className="panel-generar-informe__input" type="text" value={cliente} onChange={onCliente} placeholder="Introduce por nombre del cliente" />
            </div>
          </>
        )}
      </div>

      <div className="panel-generar-informe__opciones">
        <p className="panel-generar-informe__opciones-titulo">Opciones de filtrado adicionales</p>

        <div className="panel-generar-informe__opciones-grid">
          <div className="panel-generar-informe__opciones-grupo">
            <p className="panel-generar-informe__opciones-grupo-titulo">Opciones para las fechas</p>
            <div className="panel-generar-informe__lista-opciones">
              <OpcionFiltro label="Filtrar por orden ascendente las fechas"  selected={orden === 'ascendente'}  onClick={() => onOrden?.(orden === 'ascendente'  ? '' : 'ascendente')}  />
              <OpcionFiltro label="Filtrar por orden descendente las fechas" selected={orden === 'descendente'} onClick={() => onOrden?.(orden === 'descendente' ? '' : 'descendente')} />
            </div>
          </div>

          <div className="panel-generar-informe__opciones-grupo">
            <p className="panel-generar-informe__opciones-grupo-titulo">Opciones para las fechas</p>
            <OpcionFiltro label="Filtrar por orden alfabetico" selected={ordenAlfabetico} onClick={onOrdenAlfabetico} />
          </div>
        </div>
      </div>

      <BotonGenerarInforme onClick={onGenerarInforme} />
    </div>
  )
}

export default PanelGenerarInforme
