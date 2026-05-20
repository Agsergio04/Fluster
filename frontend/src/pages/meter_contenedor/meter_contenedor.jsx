import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './meter_contenedor.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { extraerCodigoBic } from '../../services/ocrService'
import { crearContenedor } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import SubirFotoOcr from '../../components/organismos/SubirFotoOcr'

/**
 * Página de registro de nuevos contenedores para el operador.
 * Ofrece dos vías de introducción del código BIC:
 *   1. Fotografía: se sube la imagen, el backend la procesa con Tesseract OCR
 *      y rellena el campo automáticamente con el código detectado.
 *   2. Manual: el operador escribe el código directamente sin subir foto.
 *
 * El estado `estado` controla qué vista muestra el componente SubirFotoOcr:
 *   - 'subiendo'    → pantalla inicial con los dos botones de elección
 *   - 'introducido' → imagen ya seleccionada, OCR en proceso o completado
 *   - 'manual'      → campo de texto libre sin foto
 */
function MeterContenedor() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  // Referencia al input[type=file] oculto para abrirlo programáticamente
  // sin mostrar el elemento nativo del navegador en el DOM visual
  const inputFotoRef = useRef(null)

  const [estado,      setEstado]      = useState('subiendo')
  const [foto,        setFoto]        = useState(null)
  const [codigoBic,   setCodigoBic]   = useState('')
  const [errorOcr,    setErrorOcr]    = useState('')
  const [cargandoOcr, setCargandoOcr] = useState(false)
  const [cargando,    setCargando]    = useState(false)

  const handleSeleccionarFoto = () => inputFotoRef.current?.click()

  /**
   * Se ejecuta cuando el usuario selecciona una imagen en el input de archivo.
   * Convierte el fichero a base64 (necesario para enviarlo al backend mediante JSON)
   * y lanza inmediatamente la petición de OCR para no hacer esperar al usuario.
   * Si el OCR no detecta el código el campo queda editable para corrección manual.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento del input file
   */
  const handleFotoElegida = async e => {
    const fichero = e.target.files?.[0]
    if (!fichero) return
    // Limpiamos el valor del input para que onChange vuelva a dispararse
    // si el usuario selecciona el mismo archivo una segunda vez
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
          // OCR completado pero sin resultado: dejamos el campo editable
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

  /**
   * Envía el contenedor al servidor con el código BIC en mayúsculas.
   * La foto es opcional: si el operador no subió imagen se envía null
   * y el contenedor queda sin fotografía asociada.
   * Tras el registro redirige al listado propio del operador.
   */
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

  /** Activa el modo de introducción manual y limpia cualquier dato previo. */
  const handleIntroducirManual = () => {
    setEstado('manual')
    setFoto(null)
    setCodigoBic('')
    setErrorOcr('')
  }

  /** Vuelve al estado inicial descartando la foto y el código BIC introducidos. */
  const handleCancelar = () => {
    setEstado('subiendo')
    setFoto(null)
    setCodigoBic('')
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
            Puedes introducir el contenedor mediante una foto o metiendo directamente el codigo BIC
          </p>
        </section>

        <div className="meter-contenedor__contenido">
          {/* Input oculto: se activa vía ref al pulsar "Seleccionar foto" */}
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
    </>
  )
}

export default MeterContenedor
