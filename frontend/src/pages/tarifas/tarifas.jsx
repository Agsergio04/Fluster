import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './tarifas.scss'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'
import TablaTarifas from '../../components/organismos/TablaTarifas'

function Tarifas() {
  const navigate        = useNavigate()
  const usuario         = getUsuario()
  const [tema, setTema] = useState('light')

  const [filas] = useState([])

  return (
    <div className="tarifas">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="tarifas"
        tema={tema}
        onToggleTema={() => setTema(t => t === 'light' ? 'dark' : 'light')}
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
