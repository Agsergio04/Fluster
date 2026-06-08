import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './contenedores.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import useContenedores from '../../hooks/useContenedores'
import { getUsuario } from '../../services/session'
import { actualizarContenedor, eliminarContenedor } from '../../services/contenedorService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'
import ModalEditarContenedor from '../../components/moleculas/ModalEditarContenedor'
import ModalConfirmacion from '../../components/moleculas/ModalConfirmacion'
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
  useDocumentTitle('Contenedores | Fluster')

  const { contenedores, setContenedores, cargando, aviso, setAviso } = useContenedores()
  const [busqueda, setBusqueda] = useState('')
  // Ítem actualmente en edición; null cuando el modal está cerrado
  const [editando, setEditando] = useState(null)
  // Contenedor pendiente de confirmación de borrado; null cuando no hay diálogo
  const [aBorrar,  setABorrar]  = useState(null)
  const [borrando, setBorrando] = useState(false)

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
      estado:           c.estado,
    }))

  /**
   * Guarda los cambios del modal y actualiza el contenedor en la lista local
   * haciendo merge de los campos nuevos sobre el objeto existente.
   * Cierra el modal tras el guardado exitoso. Si la actualización falla
   * (p. ej. 422 por una fecha inválida), el error se propaga al modal, que lo
   * muestra en línea junto al campo y permanece abierto para corregirlo.
   *
   * @param {string} id    - ID del contenedor a actualizar
   * @param {object} datos - Campos modificados (foto, fechaInicioLibre)
   */
  const handleActualizar = async (id, datos) => {
    const actualizado = await actualizarContenedor(id, datos)
    setContenedores(prev => prev.map(c => c._id === id ? { ...c, ...actualizado } : c))
    setEditando(null)
  }

  /**
   * Confirma el borrado del contenedor pendiente (el que abrió el diálogo):
   * lo elimina y lo quita de la lista local sin recargar. El backend rechaza
   * la operación si el contenedor tiene un ciclo activo.
   */
  const handleConfirmarBorrado = async () => {
    try {
      setBorrando(true)
      await eliminarContenedor(aBorrar.id)
      setContenedores(prev => prev.filter(c => c._id !== aBorrar.id))
      setABorrar(null)
    } catch (err) {
      setABorrar(null)
      setAviso(err.response?.data?.mensaje ?? 'No se pudo eliminar el contenedor')
    } finally {
      setBorrando(false)
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
            Aquí se encuentran todos los contenedores que has introducido
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
              onEliminar={item => setABorrar(item)}
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

      {aBorrar && (
        <ModalConfirmacion
          titulo="Borrar contenedor"
          mensaje={`¿Seguro que quieres borrar el contenedor ${aBorrar.codigoBic}? Esta acción no se puede deshacer.`}
          textoConfirmar="Borrar"
          cargando={borrando}
          onConfirmar={handleConfirmarBorrado}
          onCancelar={() => setABorrar(null)}
        />
      )}

      <Notificacion mensaje={aviso} onCerrar={() => setAviso('')} />
    </>
  )
}

export default Contenedores
