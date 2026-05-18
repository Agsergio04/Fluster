import { useState, useEffect, useCallback } from 'react'
import { obtenerContenedor } from '../services/contenedorService'

function useHistorial(id) {
  const [contenedor, setContenedor] = useState(null)
  const [ciclos,     setCiclos]     = useState([])
  const [cargando,   setCargando]   = useState(true)
  const [aviso,      setAviso]      = useState('')

  const recargar = useCallback(() => {
    obtenerContenedor(id)
      .then(data => {
        setContenedor(data)
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
