import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RutaProtegida from './RutaProtegida'
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
import GuiaEstilos from '../pages/guia_estilos/guia_estilos'
import Terminos from '../pages/terminos/terminos'
import Privacidad from '../pages/privacidad/privacidad'
import Cookies from '../pages/cookies/cookies'
import Contacto from '../pages/contacto/contacto'
import Footer from '../components/organismos/Footer'

// Grupos de roles para las rutas protegidas, definidos aquí para evitar
// arrays literales repetidos en cada Route y facilitar cambios futuros
const GESTOR      = ['gestor']
const OPERADOR    = ['operador']
const AUTENTICADO = ['gestor', 'operador', 'admin']

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/registro" element={<Registro />} />
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

        <Route path="/guia-estilos"            element={<GuiaEstilos />} />
        <Route path="/terminos-de-servicio"    element={<Terminos />} />
        <Route path="/politica-de-privacidad"  element={<Privacidad />} />
        <Route path="/cookies"                 element={<Cookies />} />
        <Route path="/contacto"                element={<Contacto />} />

        <Route path="*" element={<Navigate to="/error" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default AppRouter
