import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './contenedores.scss'
import useTema from '../../hooks/useTema'
import useContenedores from '../../hooks/useContenedores'
import { getUsuario } from '../../services/session'
import { actualizarContenedor, eliminarContenedor } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'
import ModalEditarContenedor from '../../components/moleculas/ModalEditarContenedor'
import Notificacion from '../../components/atomos/Notificacion'

/**
 * Página del listado de contenedores del operador.
 * Muestra todos los contenedores que ha registrado el usuario en sesión,
 * con opciones para editar la foto y la fecha de inicio libre,
 * o eliminar los que estén en estado INACTIVO.
 */
function Contenedores() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()

  const { contenedores, setContenedores, cargando, aviso, setAviso } = useContenedores()
  const [busqueda, setBusqueda] = useState('')
  // Ítem actualmente en edición; null cuando el modal está cerrado
  const [editando, setEditando] = useState(null)

  // Normalización al formato de tarjeta, con filtro de búsqueda aplicado en cliente
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

  /**
   * Guarda los cambios del modal y actualiza el contenedor en la lista local
   * haciendo merge de los campos nuevos sobre el objeto existente.
   * Cierra el modal tras el guardado exitoso.
   *
   * @param {string} id    - ID del contenedor a actualizar
   * @param {object} datos - Campos modificados (foto, fechaInicioLibre)
   */
  const handleActualizar = async (id, datos) => {
    try {
      const actualizado = await actualizarContenedor(id, datos)
      setContenedores(prev => prev.map(c => c._id === id ? { ...c, ...actualizado } : c))
      setEditando(null)
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo actualizar el contenedor')
    }
  }

  /**
   * Elimina el contenedor y lo quita de la lista local sin recargar.
   * El backend rechaza la operación si el contenedor tiene un ciclo activo.
   *
   * @param {{ id: string }} item - Ítem de la tarjeta con el ID
   */
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
