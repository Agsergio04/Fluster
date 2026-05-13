import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './meter_contenedor.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { extraerCodigoBic } from '../../services/ocrService'
import { crearContenedor } from '../../services/contenedorService'
import { listarNavieras } from '../../services/navieraService'
import Header from '../../components/organismos/Header'
import SubirFotoOcr from '../../components/organismos/SubirFotoOcr'

function MeterContenedor() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const inputFotoRef = useRef(null)

  const [estado,           setEstado]           = useState('subiendo')
  const [foto,             setFoto]             = useState(null)
  const [codigoBic,        setCodigoBic]        = useState('')
  const [tipo,             setTipo]             = useState('')
  const [navieraId,        setNavieraId]        = useState('')
  const [fechaInicioLibre, setFechaInicioLibre] = useState('')
  const [navieras,         setNavieras]         = useState([])
  const [cargandoOcr,      setCargandoOcr]      = useState(false)
  const [cargando,         setCargando]         = useState(false)

  useEffect(() => {
    listarNavieras()
      .then(setNavieras)
      .catch(() => {})
  }, [])

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
      setEstado('introducido')

      setCargandoOcr(true)
      try {
        const bic = await extraerCodigoBic(base64)
        setCodigoBic(bic)
      } catch {
        // OCR falló — el usuario puede introducir el código manualmente
      } finally {
        setCargandoOcr(false)
      }
    }
    reader.readAsDataURL(fichero)
  }

  const handleIntroducir = async () => {
    if (!codigoBic.trim() || !tipo.trim() || !navieraId || !fechaInicioLibre) return

    try {
      setCargando(true)
      await crearContenedor({
        codigoBIC:       codigoBic.trim().toUpperCase(),
        tipo:            tipo.trim(),
        navieraId,
        fechaInicioLibre,
      })
      navigate('/contenedores')
    } catch (err) {
      console.error('Error al crear contenedor:', err.response?.data ?? err.message)
    } finally {
      setCargando(false)
    }
  }

  const handleCancelar = () => {
    setEstado('subiendo')
    setFoto(null)
    setCodigoBic('')
    setTipo('')
    setNavieraId('')
    setFechaInicioLibre('')
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
          tipo={tipo}
          onTipoCambio={e => setTipo(e.target.value)}
          navieras={navieras}
          navieraId={navieraId}
          onNavieraCambio={e => setNavieraId(e.target.value)}
          fechaInicioLibre={fechaInicioLibre}
          onFechaInicioLibreCambio={e => setFechaInicioLibre(e.target.value)}
          cargandoOcr={cargandoOcr}
          onIntroducir={handleIntroducir}
          onCancelar={handleCancelar}
        />
      </div>
    </div>
  )
}

export default MeterContenedor
