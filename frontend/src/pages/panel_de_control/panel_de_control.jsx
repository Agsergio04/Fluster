import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './panel_de_control.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { getUsuario } from '../../services/session'
import { listarUsuarios, actualizarRol, eliminarUsuario } from '../../services/usuarioService'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'
import ModalConfirmacion from '../../components/moleculas/ModalConfirmacion'
import Notificacion from '../../components/atomos/Notificacion'

/**
 * Página de administración de usuarios. Solo accesible con rol 'admin'.
 * Permite buscar usuarios por nombre o correo, cambiar su rol
 * y eliminar cuentas del sistema de forma permanente.
 */
function PanelDeControl() {
  const navigate = useNavigate()
  const usuario  = getUsuario()
  const [tema, toggleTema] = useTema()
  useDocumentTitle('Panel de control | Fluster')

  const [busqueda, setBusqueda] = useState('')
  const [usuarios, setUsuarios] = useState([])
  const [aviso,    setAviso]    = useState('')
  const [cargando, setCargando] = useState(true)
  // Usuario pendiente de confirmación de borrado; null cuando no hay diálogo
  const [aBorrar,  setABorrar]  = useState(null)
  const [borrando, setBorrando] = useState(false)

  useEffect(() => {
    listarUsuarios()
      .then(data => setUsuarios(data))
      .catch(() => setAviso('No se pudieron cargar los usuarios'))
      .finally(() => setCargando(false))
  }, [])

  // Filtro de búsqueda por nombre y correo aplicado en el cliente
  const items = usuarios
    .filter(u =>
      !busqueda.trim() ||
      u.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.trim().toLowerCase())
    )
    .map(u => ({
      id:       u._id,
      foto:     u.foto   ?? null,
      nombre:   u.nombre,
      correo:   u.correo,
      rol:      u.rol,
      // La propia cuenta del admin en sesión no se puede eliminar
      esPropio: u._id === usuario?.id,
    }))

  /**
   * Cambia el rol de un usuario y actualiza la lista local.
   * Se protege contra el cambio del propio rol del administrador en sesión:
   * hacerlo podría dejarlo sin acceso al panel de control de inmediato.
   *
   * @param {{ id: string }} item  - Tarjeta del usuario a modificar
   * @param {string}         nuevoRol - 'admin' | 'gestor' | 'operador'
   */
  const handleCambiarRol = async (item, nuevoRol) => {
    if (item.id === usuario?.id) {
      setAviso('No puedes cambiar tu propio rol')
      return
    }
    // Si ya tiene ese rol, no hay nada que cambiar: evita un PUT redundante
    if (item.rol === nuevoRol) return
    try {
      const actualizado = await actualizarRol(item.id, nuevoRol)
      setUsuarios(prev => prev.map(u => u._id === item.id ? { ...u, rol: actualizado.rol } : u))
      setAviso('')
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo cambiar el rol')
    }
  }

  /**
   * Confirma el borrado del usuario pendiente (el que abrió el diálogo):
   * lo elimina de forma permanente y lo quita de la lista local. Los
   * contenedores que hubiera registrado permanecen (no se borran en cascada).
   * Se protege contra el borrado de la propia cuenta (además del botón, que
   * ya está deshabilitado para la tarjeta propia).
   */
  const handleConfirmarBorrado = async () => {
    if (aBorrar.id === usuario?.id) {
      setABorrar(null)
      setAviso('No puedes eliminar tu propia cuenta')
      return
    }
    try {
      setBorrando(true)
      await eliminarUsuario(aBorrar.id)
      setUsuarios(prev => prev.filter(u => u._id !== aBorrar.id))
      setABorrar(null)
    } catch (err) {
      setABorrar(null)
      setAviso(err.response?.data?.mensaje ?? 'No se pudo eliminar el usuario')
    } finally {
      setBorrando(false)
    }
  }

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="panel-de-control"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main>
        <section className="panel-de-control__intro">
          <h1 className="panel-de-control__titulo">Panel de control</h1>
          <p className="panel-de-control__subtitulo">
            Aquí puedes gestionar los usuarios de la plataforma
          </p>
        </section>

        <div className="panel-de-control__contenido">
          {cargando ? (
            <p className="panel-de-control__cargando">Cargando usuarios...</p>
          ) : (
            <ConjuntoCards
              variante="usuarios"
              itemsPorPagina={9}
              busqueda={busqueda}
              onBusquedaCambio={e => setBusqueda(e.target.value)}
              onBuscar={() => {}}
              items={items}
              onCambiarRol={handleCambiarRol}
              onEliminar={item => setABorrar(item)}
            />
          )}
        </div>
      </main>

      {aBorrar && (
        <ModalConfirmacion
          titulo="Borrar usuario"
          mensaje={`¿Seguro que quieres borrar a ${aBorrar.nombre}? Esta acción no se puede deshacer.`}
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

export default PanelDeControl
