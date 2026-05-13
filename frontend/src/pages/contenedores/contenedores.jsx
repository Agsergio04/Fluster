import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './contenedores.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { listarContenedores } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'

function Contenedores() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const [busqueda,    setBusqueda]    = useState('')
  const [contenedores, setContenedores] = useState([])

  useEffect(() => {
    listarContenedores()
      .then(data => setContenedores(data))
      .catch(() => {})
  }, [])

  const items = contenedores
    .filter(c =>
      !busqueda.trim() ||
      c.codigoBIC.toLowerCase().includes(busqueda.trim().toLowerCase())
    )
    .map(c => ({
      id:             c._id,
      codigoBic:      c.codigoBIC,
      fechaInclusion: new Date(c.creadoEn).toLocaleDateString('es-ES'),
      foto:           null,
    }))

  return (
    <div className="contenedores">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="contenedores"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <section className="contenedores__intro">
        <h1 className="contenedores__titulo">Contenedores</h1>
        <p className="contenedores__subtitulo">
          Aqui se encuentra todos los contenedores que has introducido
        </p>
      </section>

      <div className="contenedores__contenido">
        <ConjuntoCards
          variante="contenedores"
          busqueda={busqueda}
          onBusquedaCambio={e => setBusqueda(e.target.value)}
          onBuscar={() => {}}
          items={items}
          onEditar={item => {}}
          onEliminar={item => {}}
        />
      </div>
    </div>
  )
}

export default Contenedores
