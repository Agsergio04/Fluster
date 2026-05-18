import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './contenedores.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { listarContenedores, actualizarContenedor, eliminarContenedor } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'
import ModalEditarContenedor from '../../components/moleculas/ModalEditarContenedor'
import Notificacion from '../../components/atomos/Notificacion'

function Contenedores() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const [busqueda,     setBusqueda]     = useState('')
  const [contenedores, setContenedores] = useState([])
  const [editando,     setEditando]     = useState(null)
  const [aviso,        setAviso]        = useState('')
  const [cargando,     setCargando]     = useState(true)

  useEffect(() => {
    listarContenedores()
      .then(data => setContenedores(data))
      .catch(() => setAviso('No se pudieron cargar los contenedores'))
      .finally(() => setCargando(false))
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
    try {
      const actualizado = await actualizarContenedor(id, datos)
      setContenedores(prev => prev.map(c => c._id === id ? { ...c, ...actualizado } : c))
      setEditando(null)
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo actualizar el contenedor')
    }
  }

  const handleEliminar = async (item) => {
    try {
      await eliminarContenedor(item.id)
      setContenedores(prev => prev.filter(c => c._id !== item.id))
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo eliminar el contenedor')
    }
  }

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="contenedores"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main>
        <section className="contenedores__intro">
          <h1 className="contenedores__titulo">Contenedores</h1>
          <p className="contenedores__subtitulo">
            Aqui se encuentra todos los contenedores que has introducido
          </p>
        </section>

        <div className="contenedores__contenido">
          {cargando ? (
            <p className="contenedores__cargando">Cargando contenedores...</p>
          ) : (
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
          )}
        </div>
      </main>

      {editando && (
        <ModalEditarContenedor
          item={editando}
          onActualizar={handleActualizar}
          onCancelar={() => setEditando(null)}
        />
      )}

      <Notificacion mensaje={aviso} onCerrar={() => setAviso('')} />
    </>
  )
}

export default Contenedores
