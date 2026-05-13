import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './tarifas.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { listarNavieras } from '../../services/navieraService'
import Header from '../../components/organismos/Header'
import TablaTarifas from '../../components/organismos/TablaTarifas'

const navieraAFila = n => ({
  naviera: n.nombre,
  valores: [
    n.diasLibresDetention            ?? 0,
    n.diasLibresDemurrage            ?? 0,
    n.diasDetention?.[0]?.hastaDia   ?? '-',
    n.diasDemurrage?.[0]?.hastaDia   ?? '-',
    n.diasDetention?.[0]?.precioPorDia ?? '-',
    n.diasDemurrage?.[0]?.precioPorDia ?? '-',
    n.diasDetention?.[1]?.precioPorDia ?? '-',
    n.diasDemurrage?.[1]?.precioPorDia ?? '-',
  ],
})

function Tarifas() {
  const navigate        = useNavigate()
  const usuario         = getUsuario()
  const [tema, toggleTema] = useTema()

  const [filas, setFilas] = useState([])

  useEffect(() => {
    listarNavieras()
      .then(data => setFilas(data.map(navieraAFila)))
      .catch(() => {})
  }, [])

  return (
    <div className="tarifas">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="tarifas"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <section className="tarifas__intro">
        <h1 className="tarifas__titulo">Tarifas</h1>
        <p className="tarifas__subtitulo">
          Listado tanto de los dias en los cuales cambia los tramos del impuesto
          de las tarifas como el costo que se aplicaria por dia sobrepasado
        </p>
      </section>

      <div className="tarifas__contenido">
        <TablaTarifas filas={filas} />
      </div>
    </div>
  )
}

export default Tarifas
