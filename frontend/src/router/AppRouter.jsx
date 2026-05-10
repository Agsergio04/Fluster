import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/login/login'
import Home from '../pages/home/home'
import Almacen from '../pages/almacen/almacen'
import Contenedores from '../pages/contenedores/contenedores'
import MeterContenedor from '../pages/meter_contenedor/meter_contenedor'
import PanelDeControl from '../pages/panel_de_control/panel_de_control'
import Perfil from '../pages/perfil/perfil'
import Registro from '../pages/registro/registro'
import Semaforo from '../pages/semaforo/semaforo'
import Tarifas from '../pages/tarifas/tarifas'
import Error from '../pages/error/error'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/almacen" element={<Almacen />} />
        <Route path="/contenedores" element={<Contenedores />} />
        <Route path="/meter-contenedor" element={<MeterContenedor />} />
        <Route path="/panel-de-control" element={<PanelDeControl />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/semaforo" element={<Semaforo />} />
        <Route path="/tarifas" element={<Tarifas />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
