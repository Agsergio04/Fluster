import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './tarifas.scss'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import { listarNavieras, actualizarNaviera, eliminarNaviera } from '../../services/navieraService'
import Header from '../../components/organismos/Header'
import TablaTarifas from '../../components/organismos/TablaTarifas'

const navieraAFila = n => ({
  _id: n._id,
  naviera: n.nombre,
  valores: [
    n.diasLibresDetention            ?? 0,
    n.diasLibresDemurrage            ?? 0,
    n.diasDetention?.[0]?.hastaDia   ?? '-',
    n.diasDemurrage?.[0]?.hastaDia   ?? '-',
    n.diasDetention?.[0]?.precioPorDia ?? '-',
    n.diasDemurrage?.[0]?.precioPorDia ?? '-',
    n.diasDetention?.[1]?.precioPorDia ?? '-',
    n.diasDemurrage?.[1]?.precioPorDia ?? '-',
  ],
})

const valoresANaviera = (navieraOriginal, valores) => {
  const det0Hasta = Number(valores[2])
  const dem0Hasta = Number(valores[3])
  return {
    diasLibresDetention: Number(valores[0]),
    diasLibresDemurrage: Number(valores[1]),
    diasDetention: navieraOriginal.diasDetention.map((t, i) => {
      if (i === 0) return { ...t, hastaDia: det0Hasta, precioPorDia: Number(valores[4]) }
      if (i === 1) return { ...t, desdeDia: det0Hasta + 1, precioPorDia: Number(valores[6]) }
      return t
    }),
    diasDemurrage: navieraOriginal.diasDemurrage.map((t, i) => {
      if (i === 0) return { ...t, hastaDia: dem0Hasta, precioPorDia: Number(valores[5]) }
      if (i === 1) return { ...t, desdeDia: dem0Hasta + 1, precioPorDia: Number(valores[7]) }
      return t
    }),
  }
}

function Tarifas() {
  const navigate           = useNavigate()
  const usuario            = getUsuario()
  const [tema, toggleTema] = useTema()

  const [navieras, setNavieras] = useState([])

  useEffect(() => {
    listarNavieras()
      .then(data => setNavieras(data))
      .catch(() => {})
  }, [])

  const handleActualizar = async (id, valoresNuevos) => {
    const navieraOriginal = navieras.find(n => n._id === id)
    if (!navieraOriginal) return
    const cambios = valoresANaviera(navieraOriginal, valoresNuevos)
    const actualizada = await actualizarNaviera(id, cambios)
    setNavieras(prev => prev.map(n => n._id === id ? actualizada : n))
  }

  const handleEliminar = async (id) => {
    await eliminarNaviera(id)
    setNavieras(prev => prev.filter(n => n._id !== id))
  }

  const filas = navieras.map(n => ({
    ...navieraAFila(n),
    onActualizar: valoresNuevos => handleActualizar(n._id, valoresNuevos),
    onEliminar:   ()            => handleEliminar(n._id),
  }))

  return (
    <div className="tarifas">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="tarifas"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <section className="tarifas__intro">
        <h1 className="tarifas__titulo">Tarifas</h1>
        <p className="tarifas__subtitulo">
          Listado tanto de los dias en los cuales cambia los tramos del impuesto
          de las tarifas como el costo que se aplicaria por dia sobrepasado
        </p>
      </section>

      <div className="tarifas__contenido">
        <TablaTarifas filas={filas} />
      </div>
    </div>
  )
}

export default Tarifas
