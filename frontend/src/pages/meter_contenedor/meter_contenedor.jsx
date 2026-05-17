import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './meter_contenedor.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { extraerCodigoBic } from '../../services/ocrService'
import { crearContenedor } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import SubirFotoOcr from '../../components/organismos/SubirFotoOcr'

function MeterContenedor() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const inputFotoRef = useRef(null)

  const [estado,      setEstado]      = useState('subiendo')
  const [foto,        setFoto]        = useState(null)
  const [codigoBic,   setCodigoBic]   = useState('')
  const [errorOcr,    setErrorOcr]    = useState('')
  const [cargandoOcr, setCargandoOcr] = useState(false)
  const [cargando,    setCargando]    = useState(false)

  const handleSeleccionarFoto = () => inputFotoRef.current?.click()

  const handleFotoElegida = async e => {
    const fichero = e.target.files?.[0]
    if (!fichero) return
    e.target.value = ''

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      setFoto(base64)
      setCodigoBic('')
      setErrorOcr('')
      setEstado('introducido')

      setCargandoOcr(true)
      try {
        const bic = await extraerCodigoBic(base64)
        if (bic) {
          setCodigoBic(bic)
        } else {
          setErrorOcr('No se detectó código BIC. Introdúcelo manualmente.')
        }
      } catch {
        setErrorOcr('No se pudo leer la imagen. Introdúcelo manualmente.')
      } finally {
        setCargandoOcr(false)
      }
    }
    reader.readAsDataURL(fichero)
  }

  const handleIntroducir = async () => {
    if (!codigoBic.trim()) return

    try {
      setCargando(true)
      await crearContenedor({ codigoBIC: codigoBic.trim().toUpperCase(), foto })
      navigate('/contenedores')
    } catch (err) {
      console.error('Error al crear contenedor:', err.response?.data ?? err.message)
    } finally {
      setCargando(false)
    }
  }

  const handleIntroducirManual = () => {
    setEstado('manual')
    setFoto(null)
    setCodigoBic('')
    setErrorOcr('')
  }

  const handleCancelar = () => {
    setEstado('subiendo')
    setFoto(null)
    setCodigoBic('')
    setErrorOcr('')
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

      <main>
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
            aria-hidden="true"
            style={{ display: 'none' }}
            onChange={handleFotoElegida}
          />
          <SubirFotoOcr
            estado={estado}
            onSeleccionarFoto={handleSeleccionarFoto}
            onIntroducirManual={handleIntroducirManual}
            foto={foto}
            codigoBic={codigoBic}
            errorOcr={errorOcr}
            onCodigoBicCambio={e => { setCodigoBic(e.target.value); setErrorOcr('') }}
            cargandoOcr={cargandoOcr || cargando}
            onIntroducir={handleIntroducir}
            onCancelar={handleCancelar}
          />
        </div>
      </main>
    </div>
  )
}

export default MeterContenedor
