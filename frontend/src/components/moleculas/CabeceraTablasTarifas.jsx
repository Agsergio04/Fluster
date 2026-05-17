import CeldaTabla  from '../atomos/CeldaTabla'
import CeldaDetSob from '../atomos/CeldaDetSob'

function CabeceraTablasTarifas() {
  return (
    <div className="cabecera-tablas-tarifas">
      {/* Fila 1 — grupos principales */}
      <CeldaTabla label="Tiempo (dias)"               tamanio="lg" />
      <CeldaTabla label="Tarifas (euros por cada dia)" tamanio="lg" />

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
