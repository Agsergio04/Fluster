import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RutaProtegida from './RutaProtegida'
import RutaPublica from './RutaPublica'
import Login from '../pages/login/login'
import Home from '../pages/home/home'
import Almacen from '../pages/almacen/almacen'
import Contenedores from '../pages/contenedores/contenedores'
import HistorialContenedor from '../pages/historial_contenedor/historial_contenedor'
import MeterContenedor from '../pages/meter_contenedor/meter_contenedor'
import PanelDeControl from '../pages/panel_de_control/panel_de_control'
import Perfil from '../pages/perfil/perfil'
import Registro from '../pages/registro/registro'
import Semaforo from '../pages/semaforo/semaforo'
import Tarifas from '../pages/tarifas/tarifas'
import Error from '../pages/error/error'

const GESTOR     = ['gestor']
const OPERADOR   = ['operador']
const AUTENTICADO = ['gestor', 'operador', 'admin']

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<RutaPublica><Login /></RutaPublica>} />
        <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />
        <Route path="/"         element={<Home />} />
        <Route path="/error"    element={<Error />} />

        <Route path="/semaforo" element={
          <RutaProtegida roles={GESTOR}><Semaforo /></RutaProtegida>
        } />
        <Route path="/tarifas" element={
          <RutaProtegida roles={GESTOR}><Tarifas /></RutaProtegida>
        } />
        <Route path="/almacen" element={
          <RutaProtegida roles={GESTOR}><Almacen /></RutaProtegida>
        } />
        <Route path="/almacen/historial/:id" element={
          <RutaProtegida roles={GESTOR}><HistorialContenedor /></RutaProtegida>
        } />

        <Route path="/contenedores" element={
          <RutaProtegida roles={OPERADOR}><Contenedores /></RutaProtegida>
        } />
        <Route path="/meter-contenedor" element={
          <RutaProtegida roles={OPERADOR}><MeterContenedor /></RutaProtegida>
        } />

        <Route path="/panel-de-control" element={
          <RutaProtegida roles={['admin']}><PanelDeControl /></RutaProtegida>
        } />
        <Route path="/perfil" element={
          <RutaProtegida roles={AUTENTICADO}><Perfil /></RutaProtegida>
        } />

        <Route path="*" element={<Navigate to="/error" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
