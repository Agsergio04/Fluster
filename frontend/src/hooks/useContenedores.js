import { useState, useEffect } from 'react'
import { listarContenedores } from '../services/contenedorService'

function useContenedores() {
  const [contenedores, setContenedores] = useState([])
  const [cargando,     setCargando]     = useState(true)
  const [aviso,        setAviso]        = useState('')

  useEffect(() => {
    listarContenedores()
      .then(data => setContenedores(data))
      .catch(() => setAviso('No se pudieron cargar los contenedores'))
      .finally(() => setCargando(false))
  }, [])

  return { contenedores, setContenedores, cargando, aviso, setAviso }
}

export default useContenedores
