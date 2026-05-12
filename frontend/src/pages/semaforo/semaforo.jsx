import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './semaforo.scss'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'
import ConjuntoCards from '../../components/organismos/ConjuntoCards'

const TRAMOS = ['sin-coste', 'primer-tramo', 'segundo-tramo', 'inactivo']

function Semaforo() {
  const navigate = useNavigate()
  const usuario = getUsuario()
  const [tema, setTema] = useState('light')
  const [busquedas, setBusquedas] = useState({ 'sin-coste': '', 'primer-tramo': '', 'segundo-tramo': '', 'inactivo': '' })
  const [items] = useState({ 'sin-coste': [], 'primer-tramo': [], 'segundo-tramo': [], 'inactivo': [] })

  const handleBusquedaCambio = (tramo, valor) =>
    setBusquedas(prev => ({ ...prev, [tramo]: valor }))

  return (
    <div className="semaforo">
      <Header
        rol={usuario?.rol ?? null}
        seccionActiva="seguimiento"
        tema={tema}
        onToggleTema={() => setTema(t => t === 'light' ? 'dark' : 'light')}
        onNavegar={ruta => navigate(ruta)}
      />

      <section className="semaforo__intro">
        <h1 className="semaforo__titulo">Estado de los contenedores</h1>
        <p className="semaforo__subtitulo">
          Visualizacion en tiempo real del estado de los contenedores y los costes
          asociados a la detencion y sobreestadía de dichos contenedores
        </p>
      </section>

      <div className="semaforo__contenido">
        {TRAMOS.map(tramo => (
          <ConjuntoCards
            key={tramo}
            variante="semaforo"
            tramo={tramo}
            busqueda={busquedas[tramo]}
            onBusquedaCambio={e => handleBusquedaCambio(tramo, e.target.value)}
            onBuscar={() => {}}
            items={items[tramo]}
          />
        ))}
      </div>
    </div>
  )
}

export default Semaforo
