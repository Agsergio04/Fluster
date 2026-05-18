import { useState, useEffect } from 'react'
import { listarContenedores } from '../services/contenedorService'

/**
 * Hook personalizado para gestionar el listado de contenedores.
 * Realiza la carga inicial automáticamente al montarse el componente
 * y expone el setter para que los componentes puedan actualizar la lista
 * localmente sin necesidad de hacer una nueva petición al servidor.
 *
 * @returns {{ contenedores, setContenedores, cargando, aviso, setAviso }}
 */
function useContenedores() {
  const [contenedores, setContenedores] = useState([])
  const [cargando,     setCargando]     = useState(true)
  const [aviso,        setAviso]        = useState('')

  useEffect(() => {
    listarContenedores()
      .then(data => setContenedores(data))
      .catch(() => setAviso('No se pudieron cargar los contenedores'))
      .finally(() => setCargando(false))
  }, []) // Sin dependencias: solo se ejecuta una vez al montar

  return { contenedores, setContenedores, cargando, aviso, setAviso }
}

export default useContenedores
