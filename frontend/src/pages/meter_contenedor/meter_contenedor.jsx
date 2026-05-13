import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './meter_contenedor.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'
import SubirFotoOcr from '../../components/organismos/SubirFotoOcr'

function MeterContenedor() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const inputFotoRef = useRef(null)

  const [estado,    setEstado]    = useState('subiendo')
  const [foto,      setFoto]      = useState(null)
  const [codigoBic, setCodigoBic] = useState('')

  const handleSeleccionarFoto = () => inputFotoRef.current?.click()

  const handleFotoElegida = e => {
    const fichero = e.target.files?.[0]
    if (!fichero) return
    setFoto(URL.createObjectURL(fichero))
    setEstado('introducido')
    e.target.value = ''
  }

  const handleIntroducir = () => {
    // TODO: conectar con API de contenedores
    handleCancelar()
  }

  const handleCancelar = () => {
    setEstado('subiendo')
    setFoto(null)
    setCodigoBic('')
  }

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
          Puedes introducir el contenedor mediante una foto o metiendo directamente el codigo BIC
        </p>
      </section>

      <div className="meter-contenedor__contenido">
        <input
          ref={inputFotoRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFotoElegida}
        />
        <SubirFotoOcr
          estado={estado}
          onSeleccionarFoto={handleSeleccionarFoto}
          foto={foto}
          codigoBic={codigoBic}
          onCodigoBicCambio={e => setCodigoBic(e.target.value)}
          onIntroducir={handleIntroducir}
          onCancelar={handleCancelar}
        />
      </div>
    </div>
  )
}

export default MeterContenedor
