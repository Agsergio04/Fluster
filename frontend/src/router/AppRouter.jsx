import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/login/login'
import Home from '../pages/home/home'
import Almacen from '../pages/almacen/almacen'
import Contenedores from '../pages/contenedores/contenedores'
import MeterContenedor from '../pages/meter_contenedor/meter_contenedor'
import PanelDeControl from '../pages/panel_de_control/panel_de_control'

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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
