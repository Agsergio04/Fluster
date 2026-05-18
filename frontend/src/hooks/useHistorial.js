import { useState, useEffect, useCallback } from 'react'
import { obtenerContenedor } from '../services/contenedorService'

/**
 * Hook personalizado para gestionar el historial de ciclos de un contenedor.
 * Recibe el ID del contenedor por parámetro y carga los datos al montarse.
 * Expone la función recargar para que la página pueda refrescar los datos
 * después de editar manualmente un tramo sin tener que desmontar el componente.
 *
 * @param {string} id - ID MongoDB del contenedor
 * @returns {{ contenedor, ciclos, cargando, aviso, setAviso, recargar }}
 */
function useHistorial(id) {
  const [contenedor, setContenedor] = useState(null)
  const [ciclos,     setCiclos]     = useState([])
  const [cargando,   setCargando]   = useState(true)
  const [aviso,      setAviso]      = useState('')

  // useCallback estabiliza la referencia para que el useEffect
  // no se dispare en cada render aunque cambie el id
  const recargar = useCallback(() => {
    obtenerContenedor(id)
      .then(data => {
        setContenedor(data)
        // Normalizamos los ciclos para que la vista reciba siempre
        // la misma forma, independientemente de si clienteId está poblado
        setCiclos(
          (data.ciclos ?? []).map(c => ({
            cicloId:   c._id,
            cliente:   c.clienteId?.nombre ?? '-',
            demurrage: c.demurrage,
            detention: c.detention,
          }))
        )
      })
      .catch(() => setAviso('No se pudo cargar el historial del contenedor'))
      .finally(() => setCargando(false))
  }, [id])

  useEffect(() => { recargar() }, [recargar])

  return { contenedor, ciclos, cargando, aviso, setAviso, recargar }
}

export default useHistorial
