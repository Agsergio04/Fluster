import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './contenedores.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { listarContenedores, actualizarContenedor, eliminarContenedor } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'
import ModalEditarContenedor from '../../components/moleculas/ModalEditarContenedor'

function Contenedores() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const [busqueda,     setBusqueda]     = useState('')
  const [contenedores, setContenedores] = useState([])
  const [editando,     setEditando]     = useState(null)

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
      id:               c._id,
      codigoBic:        c.codigoBIC,
      fechaInclusion:   new Date(c.fechaInicioLibre).toLocaleDateString('es-ES'),
      fechaInicioLibre: c.fechaInicioLibre,
      foto:             c.foto ?? null,
    }))

  const handleActualizar = async (id, datos) => {
    const actualizado = await actualizarContenedor(id, datos)
    setContenedores(prev => prev.map(c => c._id === id ? { ...c, ...actualizado } : c))
    setEditando(null)
  }

  const handleEliminar = async (item) => {
    await eliminarContenedor(item.id)
    setContenedores(prev => prev.filter(c => c._id !== item.id))
  }

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
          itemsPorPagina={9}
          busqueda={busqueda}
          onBusquedaCambio={e => setBusqueda(e.target.value)}
          onBuscar={() => {}}
          items={items}
          onEditar={item => setEditando(item)}
          onEliminar={handleEliminar}
        />
      </div>

      {editando && (
        <ModalEditarContenedor
          item={editando}
          onActualizar={handleActualizar}
          onCancelar={() => setEditando(null)}
        />
      )}
    </div>
  )
}

export default Contenedores
