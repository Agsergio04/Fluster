import { useNavigate } from 'react-router-dom'
import './meter_contenedor.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'

function MeterContenedor() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  return (
    <div className="meter-contenedor">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="meter-contenedor"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <section className="meter-contenedor__intro">
        <h1 className="meter-contenedor__titulo">Meter contenedor</h1>
        <p className="meter-contenedor__subtitulo">
          Introduce los datos del contenedor para registrarlo en el sistema
        </p>
      </section>
    </div>
  )
}

export default MeterContenedor
