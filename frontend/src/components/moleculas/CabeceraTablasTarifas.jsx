import CeldaTabla  from '../atomos/CeldaTabla'
import CeldaDetSob from '../atomos/CeldaDetSob'

/**
 * Cabecera de tres niveles para la tabla de tarifas:
 * fila 1 — grupos principales (Tiempo / Tarifas),
 * fila 2 — subgrupos (free time, límite tramo 1, tramo 1, tramo 2),
 * fila 3 — par Detención/Sobrestadía por cada subgrupo.
 * Solo tiene contenido estático, sin props ni estado.
 */
function CabeceraTablasTarifas() {
  return (
    <div className="cabecera-tablas-tarifas">
      {/* Fila 1 — grupos principales */}
      <CeldaTabla label="Tiempo (días)"               tamanio="lg" />
      <CeldaTabla label="Tarifas (euros por cada día)" tamanio="lg" />

      {/* Fila 2 — subgrupos */}
      <CeldaTabla label="Duración del free time" tamanio="md" />
      <CeldaTabla label="Limite Primer Tramo"    tamanio="md" />
      <CeldaTabla label="Primer Tramo"           tamanio="md" />
      <CeldaTabla label="Segundo Tramo"          tamanio="md" />

      {/* Fila 3 — Det/Sob por tramo */}
      <CeldaDetSob />
      <CeldaDetSob />
      <CeldaDetSob />
      <CeldaDetSob />
    </div>
  )
}

export default CabeceraTablasTarifas
