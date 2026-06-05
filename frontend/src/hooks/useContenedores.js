import { useState, useEffect } from 'react'
import { listarContenedores } from '../services/contenedorService'
import { getUsuario } from '../services/session'

function useContenedores() {
  const [contenedores, setContenedores] = useState([])
  const [cargando,     setCargando]     = useState(true)
  const [aviso,        setAviso]        = useState('')

  const usuarioId = getUsuario()?.id

  useEffect(() => {
    // El flag evita actualizar el estado si el efecto se limpia (cambio de
    // usuario o desmontaje) antes de que la petición resuelva.
    let activo = true
    listarContenedores()
      .then(data => { if (activo) { setContenedores(data); setAviso('') } })
      .catch(() => { if (activo) setAviso('No se pudieron cargar los contenedores') })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [usuarioId])

  return { contenedores, setContenedores, cargando, aviso, setAviso }
}

export default useContenedores
