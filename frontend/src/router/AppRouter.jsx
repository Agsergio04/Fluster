import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RutaProtegida from './RutaProtegida'
import Footer from '../components/organismos/Footer'
import Spinner from '../components/atomos/Spinner'

// Páginas cargadas en el bundle inicial — son las primeras que ve cualquier usuario
import Login          from '../pages/login/login'
import Home           from '../pages/home/home'
import Registro       from '../pages/registro/registro'
import Error          from '../pages/error/error'
import MeterContenedor from '../pages/meter_contenedor/meter_contenedor'

// Páginas con carga diferida — Vite genera un chunk independiente por cada una;
// el navegador solo lo descarga cuando el usuario navega a esa ruta por primera vez
const Almacen             = lazy(() => import('../pages/almacen/almacen'))
const Contenedores        = lazy(() => import('../pages/contenedores/contenedores'))
const HistorialContenedor = lazy(() => import('../pages/historial_contenedor/historial_contenedor'))
const PanelDeControl      = lazy(() => import('../pages/panel_de_control/panel_de_control'))
const Perfil              = lazy(() => import('../pages/perfil/perfil'))
const Semaforo            = lazy(() => import('../pages/semaforo/semaforo'))
const Tarifas             = lazy(() => import('../pages/tarifas/tarifas'))
const Terminos            = lazy(() => import('../pages/terminos/terminos'))
const Privacidad          = lazy(() => import('../pages/privacidad/privacidad'))
const Cookies             = lazy(() => import('../pages/cookies/cookies'))
const Contacto            = lazy(() => import('../pages/contacto/contacto'))

const GESTOR      = ['gestor']
const OPERADOR    = ['operador']
const AUTENTICADO = ['gestor', 'operador', 'admin']

const fallback = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
    <Spinner tamanio="lg" />
  </div>
)

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={fallback}>
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

          <Route path="/terminos-de-servicio"   element={<Terminos />} />
          <Route path="/politica-de-privacidad" element={<Privacidad />} />
          <Route path="/cookies"                element={<Cookies />} />
          <Route path="/contacto"               element={<Contacto />} />

          <Route path="*" element={<Navigate to="/error" replace />} />
        </Routes>
        <Footer />
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
