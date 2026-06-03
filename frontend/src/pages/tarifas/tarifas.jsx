import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './tarifas.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { getUsuario } from '../../services/session'
import { listarNavieras, actualizarNaviera, eliminarNaviera } from '../../services/navieraService'
import Header from '../../components/organismos/Header'
import TablaTarifas from '../../components/organismos/TablaTarifas'
import Notificacion from '../../components/atomos/Notificacion'

/**
 * Transforma un objeto naviera del servidor en la estructura de fila
 * que espera TablaTarifas: un array plano de 8 valores en el orden
 * [diasLibresDet, diasLibresDem, hastaDet, hastaDem,
 *  precioTr1Det, precioTr1Dem, precioTr2Det, precioTr2Dem].
 * Este orden coincide exactamente con las columnas de la tabla.
 *
 * @param {object} n - Naviera del servidor
 */
const navieraAFila = n => ({
  _id: n._id,
  naviera: (n.codigo ?? n.nombre).slice(0, 3).toUpperCase(),
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

/** Convierte cualquier valor a número; devuelve 0 si el resultado es NaN. */
const num = v => { const n = Number(v); return isNaN(n) ? 0 : n }

/**
 * Reconstruye el objeto naviera completo a partir del array plano de valores
 * editados en la tabla. El tramo 2 empieza el día siguiente al límite del tramo 1
 * y no tiene límite superior (hastaDia: null), tal como define el modelo de datos.
 *
 * @param {Array} valores - Array de 8 valores editados por el usuario
 * @returns {object} Campos de naviera listos para enviar al servidor
 */
const valoresANaviera = (valores) => {
  const det0Hasta = num(valores[2])
  const dem0Hasta = num(valores[3])
  return {
    diasLibresDetention: num(valores[0]),
    diasLibresDemurrage: num(valores[1]),
    diasDetention: [
      { desdeDia: 1,              hastaDia: det0Hasta, precioPorDia: num(valores[4]) },
      { desdeDia: det0Hasta + 1,  hastaDia: null,      precioPorDia: num(valores[6]) },
    ],
    diasDemurrage: [
      { desdeDia: 1,              hastaDia: dem0Hasta, precioPorDia: num(valores[5]) },
      { desdeDia: dem0Hasta + 1,  hastaDia: null,      precioPorDia: num(valores[7]) },
    ],
  }
}

/**
 * Página de gestión de navieras y tarifas para el gestor.
 * Muestra las navieras en una tabla editable en línea; cada fila
 * se puede editar y guardar de forma independiente sin afectar al resto.
 */
function Tarifas() {
  const navigate           = useNavigate()
  const usuario            = getUsuario()
  const [tema, toggleTema] = useTema()
  useDocumentTitle('Tarifas | Fluster')

  const [navieras, setNavieras] = useState([])
  const [aviso,    setAviso]    = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    listarNavieras()
      .then(data => setNavieras(data))
      .catch(() => setAviso('No se pudieron cargar las tarifas'))
      .finally(() => setCargando(false))
  }, [])

  /**
   * Transforma los valores editados al formato del servidor, guarda los cambios
   * y actualiza solo la fila afectada en el estado local para evitar recargar
   * toda la lista.
   *
   * @param {string} id           - ID de la naviera a actualizar
   * @param {Array}  valoresNuevos - Array plano de 8 valores editados
   */
  const handleActualizar = async (id, valoresNuevos) => {
    // Ningún valor de la tarifa (días libres, límites de tramo o precios) puede ser negativo
    if (valoresNuevos.some(v => Number(v) < 0)) {
      setAviso('Los valores de la tarifa no pueden ser negativos')
      return
    }
    try {
      const cambios = valoresANaviera(valoresNuevos)
      const actualizada = await actualizarNaviera(id, cambios)
      setNavieras(prev => prev.map(n => n._id === id ? actualizada : n))
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo actualizar la tarifa')
    }
  }

  /**
   * Elimina la naviera del sistema y la quita de la lista local.
   * El backend puede rechazar la operación si la naviera tiene
   * contenedores activos asociados.
   *
   * @param {string} id - ID de la naviera a eliminar
   */
  const handleEliminar = async (id) => {
    try {
      await eliminarNaviera(id)
      setNavieras(prev => prev.filter(n => n._id !== id))
    } catch (err) {
      setAviso(err.response?.data?.mensaje ?? 'No se pudo eliminar la naviera')
    }
  }

  // Se añaden los manejadores a cada fila para que TablaTarifas no necesite
  // conocer el ID de la naviera ni la lógica de actualización
  const filas = navieras.map(n => ({
    ...navieraAFila(n),
    onActualizar: valoresNuevos => handleActualizar(n._id, valoresNuevos),
    onEliminar:   ()            => handleEliminar(n._id),
  }))

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="tarifas"
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main>
        <section className="tarifas__intro">
          <h1 className="tarifas__titulo">Tarifas</h1>
          <p className="tarifas__subtitulo">
            Listado tanto de los días en los cuales cambian los tramos del impuesto
            de las tarifas como el coste que se aplicaría por día sobrepasado
          </p>
        </section>

        <div className="tarifas__contenido">
          {cargando ? (
            <p className="tarifas__cargando">Cargando tarifas...</p>
          ) : (
            <TablaTarifas filas={filas} />
          )}
        </div>
      </main>

      <Notificacion mensaje={aviso} onCerrar={() => setAviso('')} />
    </>
  )
}

export default Tarifas
