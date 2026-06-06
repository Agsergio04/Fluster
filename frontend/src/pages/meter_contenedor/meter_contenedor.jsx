import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './meter_contenedor.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { getUsuario } from '../../services/session'
import { extraerCodigoBic } from '../../services/ocrService'
import { crearContenedor } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import SubirFotoOcr from '../../components/organismos/SubirFotoOcr'

/**
 * Página de registro de nuevos contenedores para el operador, con dos flujos
 * independientes:
 *   1. Escaneo OCR: se sube/arrastra una foto, el backend la procesa con
 *      Tesseract OCR y rellena el código BIC; desde ahí se introduce o se
 *      cancela (descarta la foto y el código detectado).
 *   2. Entrada manual: el operador escribe el código y lo introduce.
 * Cada flujo tiene su propio campo de código y su propio botón de registro.
 */
function MeterContenedor() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()
  useDocumentTitle('Meter contenedor | Fluster')

  // Input[type=file] oculto, se abre vía ref desde la zona de subida
  const inputFotoRef = useRef(null)

  const [foto,            setFoto]            = useState(null)
  const [codigoBicOcr,    setCodigoBicOcr]    = useState('')
  const [codigoBicManual, setCodigoBicManual] = useState('')
  const [errorOcr,        setErrorOcr]        = useState('')
  const [errorManual,     setErrorManual]     = useState('')
  const [cargandoOcr,     setCargandoOcr]     = useState(false)
  const [cargando,        setCargando]        = useState(false)

  const handleSeleccionarFoto = () => inputFotoRef.current?.click()

  /**
   * Procesa la foto elegida (por botón o arrastre): la convierte a base64 y
   * lanza el OCR para rellenar el código BIC del bloque de escaneo. Si el OCR
   * no detecta nada, el campo queda editable para corregirlo a mano.
   *
   * @param {File} fichero
   */
  const procesarFoto = (fichero) => {
    if (!fichero) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      setFoto(base64)
      setCodigoBicOcr('')
      setErrorOcr('')
      setCargandoOcr(true)
      try {
        const bic = await extraerCodigoBic(base64)
        if (bic) setCodigoBicOcr(bic)
        else setErrorOcr('No se detectó código BIC. Introdúcelo manualmente.')
      } catch {
        setErrorOcr('No se pudo leer la imagen. Introdúcelo manualmente.')
      } finally {
        setCargandoOcr(false)
      }
    }
    reader.readAsDataURL(fichero)
  }

  const handleFotoElegida = e => {
    const fichero = e.target.files?.[0]
    e.target.value = '' // permite reelegir el mismo archivo
    procesarFoto(fichero)
  }

  const handleSoltarFoto = e => {
    e.preventDefault()
    procesarFoto(e.dataTransfer?.files?.[0])
  }

  /**
   * Registra el contenedor con el código y la foto indicados (la foto es null
   * en la entrada manual). Tras el registro redirige al listado del operador.
   */
  const registrar = async (codigoBIC, fotoAsociada, setError) => {
    if (!codigoBIC.trim()) return
    try {
      setCargando(true)
      await crearContenedor({ codigoBIC: codigoBIC.trim().toUpperCase(), foto: fotoAsociada })
      navigate('/contenedores')
    } catch (err) {
      setError(err.response?.data?.mensaje ?? 'No se pudo registrar el contenedor')
    } finally {
      setCargando(false)
    }
  }

  const handleIntroducirOcr    = () => registrar(codigoBicOcr, foto, setErrorOcr)
  const handleIntroducirManual = () => registrar(codigoBicManual, null, setErrorManual)

  /** Descarta la foto y el código del OCR, volviendo a la zona de subida. */
  const handleCancelarOcr = () => {
    setFoto(null)
    setCodigoBicOcr('')
    setErrorOcr('')
  }

  return (
    <>
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
            Registra una nueva unidad escaneando una foto (OCR) o introduciendo el código BIC manualmente
          </p>
        </section>

        <div className="meter-contenedor__contenido">
          {/* Input oculto: se activa vía ref al pulsar la zona de subida */}
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            aria-label="Seleccionar foto del contenedor"
            aria-hidden="true"
            style={{ display: 'none' }}
            onChange={handleFotoElegida}
          />
          <SubirFotoOcr
            foto={foto}
            onSeleccionarFoto={handleSeleccionarFoto}
            onSoltarFoto={handleSoltarFoto}
            codigoBicOcr={codigoBicOcr}
            onCodigoBicOcrCambio={e => { setCodigoBicOcr(e.target.value); setErrorOcr('') }}
            errorOcr={errorOcr}
            cargandoOcr={cargandoOcr}
            cargando={cargando}
            onIntroducirOcr={handleIntroducirOcr}
            onCancelarOcr={handleCancelarOcr}
            codigoBicManual={codigoBicManual}
            onCodigoBicManualCambio={e => { setCodigoBicManual(e.target.value); setErrorManual('') }}
            errorManual={errorManual}
            onIntroducirManual={handleIntroducirManual}
          />
        </div>
      </main>
    </>
  )
}

export default MeterContenedor
