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
      <h3 className="panel-generar-informe__seccion-titulo">Rango entre fechas</h3>

      <div className="panel-generar-informe__rango">
        <div className="panel-generar-informe__campo-fecha">
          <label htmlFor="filtro-fecha-desde" className="panel-generar-informe__campo-titulo">
            Desde
          </label>
          <input
            id="filtro-fecha-desde"
            className="panel-generar-informe__input"
            type="date"
            value={fechaDesde}
            onChange={onFechaDesde}
          />
        </div>
        <div className="panel-generar-informe__campo-fecha">
          <label htmlFor="filtro-fecha-hasta" className="panel-generar-informe__campo-titulo">
            Hasta
          </label>
          <input
            id="filtro-fecha-hasta"
            className="panel-generar-informe__input"
            type="date"
            value={fechaHasta}
            onChange={onFechaHasta}
          />
        </div>
      </div>

      <div className="panel-generar-informe__campo-unico">
        <label htmlFor="filtro-fecha-especifica" className="panel-generar-informe__campo-label">
          Filtrado por fecha en especifico
        </label>
        <input
          id="filtro-fecha-especifica"
          className="panel-generar-informe__input"
          type="date"
          value={fechaEspecifica}
          onChange={onFechaEspecifica}
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
              <label htmlFor="filtro-cliente" className="panel-generar-informe__campo-label">
                Filtrado por el nombre del cliente
              </label>
              <input
                id="filtro-cliente"
                className="panel-generar-informe__input"
                type="text"
                value={cliente}
                onChange={onCliente}
                placeholder="Introduce por nombre del cliente"
              />
            </div>
            <div className="panel-generar-informe__campo-unico">
              <label htmlFor="filtro-naviera" className="panel-generar-informe__campo-label">
                Filtrado por la naviera
              </label>
              <input
                id="filtro-naviera"
                className="panel-generar-informe__input"
                type="text"
                value={naviera}
                onChange={onNaviera}
                placeholder="Introduce la naviera"
              />
            </div>
            <div className="panel-generar-informe__campo-unico">
              <label htmlFor="filtro-bic" className="panel-generar-informe__campo-label">
                Filtrado por el codigo Bic
              </label>
              <input
                id="filtro-bic"
                className="panel-generar-informe__input"
                type="text"
                value={codigoBic}
                onChange={onCodigoBic}
                placeholder="Introduce el codigo Bic"
              />
            </div>
          </div>
        )}

        {esIndividual && (
          <>
            <div className="panel-generar-informe__campo-unico">
              <label htmlFor="filtro-naviera-ind" className="panel-generar-informe__campo-label">
                Filtrado por la naviera
              </label>
              <input
                id="filtro-naviera-ind"
                className="panel-generar-informe__input"
                type="text"
                value={naviera}
                onChange={onNaviera}
                placeholder="Introduce la naviera"
              />
            </div>
            <div className="panel-generar-informe__campo-unico">
              <label htmlFor="filtro-cliente-ind" className="panel-generar-informe__campo-label">
                Filtrado por el nombre del cliente
              </label>
              <input
                id="filtro-cliente-ind"
                className="panel-generar-informe__input"
                type="text"
                value={cliente}
                onChange={onCliente}
                placeholder="Introduce por nombre del cliente"
              />
            </div>
          </>
        )}
      </div>

      <div className="panel-generar-informe__opciones">
        <h3 className="panel-generar-informe__opciones-titulo">Opciones de filtrado adicionales</h3>

        <div className="panel-generar-informe__opciones-grid">
          <div className="panel-generar-informe__opciones-grupo">
            <h4 className="panel-generar-informe__opciones-grupo-titulo">Opciones para las fechas</h4>
            <div className="panel-generar-informe__lista-opciones">
              <OpcionFiltro label="Filtrar por orden ascendente las fechas"  selected={orden === 'ascendente'}  onClick={() => onOrden?.(orden === 'ascendente'  ? '' : 'ascendente')}  />
              <OpcionFiltro label="Filtrar por orden descendente las fechas" selected={orden === 'descendente'} onClick={() => onOrden?.(orden === 'descendente' ? '' : 'descendente')} />
            </div>
          </div>

          <div className="panel-generar-informe__opciones-grupo">
            <h4 className="panel-generar-informe__opciones-grupo-titulo">Opciones para el orden</h4>
            <OpcionFiltro label="Filtrar por orden alfabetico" selected={ordenAlfabetico} onClick={onOrdenAlfabetico} />
          </div>
        </div>
      </div>

      <BotonGenerarInforme onClick={onGenerarInforme} />
    </div>
  )
}

export default PanelGenerarInforme
