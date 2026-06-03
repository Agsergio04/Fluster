import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './guia_estilos.scss'
import useTema from '../../hooks/useTema'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'

// Átomos
import Input from '../../components/atomos/Input'
import InputContrasenia from '../../components/atomos/InputContrasenia'
import Spinner from '../../components/atomos/Spinner'
import RolAsignado from '../../components/atomos/RolAsignado'
import EstadoContenedorSemaforo from '../../components/atomos/EstadoContenedorSemaforo'
import CabeceraTramo from '../../components/atomos/CabeceraTramo'
import BotonRegistroLogin from '../../components/atomos/BotonRegistroLogin'
import BotonDecision from '../../components/atomos/BotonDecision'
import BotonCardAlmacen from '../../components/atomos/BotonCardAlmacen'
import BotonOperacionesPerfil from '../../components/atomos/BotonOperacionesPerfil'
import BotonRol from '../../components/atomos/BotonRol'
import BotonRolesCardUsuario from '../../components/atomos/BotonRolesCardUsuario'
import BotonCambioSeccion from '../../components/atomos/BotonCambioSeccion'
import BotonIniciarSesion from '../../components/atomos/BotonIniciarSesion'
import BotonEliminar from '../../components/atomos/BotonEliminar'
import BotonEditar from '../../components/atomos/BotonEditar'
import BotonGenerarInforme from '../../components/atomos/BotonGenerarInforme'
import BotonCambiarTema from '../../components/atomos/BotonCambiarTema'
import BotonEmpezarAhora from '../../components/atomos/BotonEmpezarAhora'
import CeldaTabla from '../../components/atomos/CeldaTabla'

// Moléculas
import OpcionFiltro from '../../components/moleculas/OpcionFiltro'
import BuscadorCard from '../../components/moleculas/BuscadorCard'
import CardContenedoresAlmacen from '../../components/moleculas/CardContenedoresAlmacen'

// Organismos
import CardSemaforo from '../../components/organismos/CardSemaforo'

// Iconos para BotonRol
import OperadorIcon from '../../assets/icons/Icono Operador.svg?react'
import GestorIcon from '../../assets/icons/Icono Gestor.svg?react'

const NOOP = () => {}

function GuiaEstilos() {
  const navigate    = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario     = getUsuario()
  useDocumentTitle('Guía de estilos | Fluster')

  const [busqueda,     setBusqueda]     = useState('')
  const [celdaValor,   setCeldaValor]   = useState('MSCU1234567')
  const [filtroA,      setFiltroA]      = useState(false)
  const [filtroB,      setFiltroB]      = useState(true)

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main className="pagina-estatica guia-estilos">

        {/* ── INTRO ──────────────────────────────────────────────────── */}
        <section className="pagina-estatica__intro">
          <h1 className="pagina-estatica__titulo">Guía de estilos</h1>
          <p className="pagina-estatica__subtitulo">
            Todos los componentes, variantes, tamaños y estados del sistema de diseño de Fluster.
          </p>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            1. COLORES
        ══════════════════════════════════════════════════════════════ */}
        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Colores</h2>

          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Brand</p>
            <div className="pagina-estatica__paleta">
              {[
                ['Primary',          '--color-primary'],
                ['Primary Hover',    '--color-primary-hover'],
                ['Secondary',        '--color-secondary'],
                ['Secondary Hover',  '--color-secondary-hover'],
              ].map(([nombre, v]) => (
                <div key={v} className="pagina-estatica__color">
                  <div className="pagina-estatica__color-muestra" style={{ backgroundColor: `var(${v})` }} />
                  <span className="pagina-estatica__color-nombre">{nombre}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Neutros</p>
            <div className="pagina-estatica__paleta">
              {[
                ['Background',   '--color-bg'],
                ['Surface',      '--color-surface'],
                ['Border',       '--color-border'],
                ['Text',         '--color-box-text'],
                ['Text Subtle',  '--color-text-subtle'],
              ].map(([nombre, v]) => (
                <div key={v} className="pagina-estatica__color">
                  <div className="pagina-estatica__color-muestra" style={{ backgroundColor: `var(${v})` }} />
                  <span className="pagina-estatica__color-nombre">{nombre}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Semáforo</p>
            <div className="pagina-estatica__paleta">
              {[
                ['Sin coste',      '--color-sin_costes'],
                ['Primer tramo',   '--color-primer_tramo'],
                ['Segundo tramo',  '--color-segundo_tramo'],
                ['Inactivo',       '--color-inactivo'],
              ].map(([nombre, v]) => (
                <div key={v} className="pagina-estatica__color">
                  <div className="pagina-estatica__color-muestra" style={{ backgroundColor: `var(${v})` }} />
                  <span className="pagina-estatica__color-nombre">{nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            2. TIPOGRAFÍA
        ══════════════════════════════════════════════════════════════ */}
        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Tipografía</h2>

          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Crimson Text — Headings</p>
            <div className="pagina-estatica__tipografias">
              {[
                ['64 px', 'var(--texto-tamanio-64)'],
                ['48 px', 'var(--texto-tamanio-48)'],
                ['32 px', 'var(--texto-tamanio-32)'],
              ].map(([label, size]) => (
                <div key={label} className="pagina-estatica__tipo-ejemplo">
                  <span className="pagina-estatica__tipo-label">{label}</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: size, color: 'var(--color-box-text)', lineHeight: 1 }}>
                    Gestión portuaria
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Poppins — Body</p>
            <div className="pagina-estatica__tipografias">
              {[
                ['24 px  Regular',  'var(--text-24)', 400],
                ['16 px  Regular',  'var(--text-16)', 400],
                ['16 px  Semibold', 'var(--text-16)', 600],
                ['16 px  Bold',     'var(--text-16)', 700],
              ].map(([label, size, weight]) => (
                <div key={label} className="pagina-estatica__tipo-ejemplo">
                  <span className="pagina-estatica__tipo-label">{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: size, fontWeight: weight, color: 'var(--color-box-text)', lineHeight: 1.5 }}>
                    Contenedor MSCU1234567 en primer tramo de demurrage
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            3. ESPACIADO
        ══════════════════════════════════════════════════════════════ */}
        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Espaciado</h2>
          <p className="pagina-estatica__seccion-texto">
            Escala base 8 px. Todas las medidas de espaciado son múltiplos de 8.
          </p>
          <div className="pagina-estatica__tipografias">
            {[
              ['space-8',  'var(--space-8)'],
              ['space-16', 'var(--space-16)'],
              ['space-24', 'var(--space-24)'],
              ['space-32', 'var(--space-32)'],
              ['space-48', 'var(--space-48)'],
              ['space-64', 'var(--space-64)'],
              ['space-96', 'var(--space-96)'],
            ].map(([label, token]) => (
              <div key={label} className="pagina-estatica__tipo-ejemplo">
                <span className="pagina-estatica__tipo-label">{label}</span>
                <div className="sg-espacio-barra" style={{ width: token }} />
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            4. BOTONES
        ══════════════════════════════════════════════════════════════ */}
        <section className="pagina-estatica__seccion pagina-estatica__seccion--ancha">
          <h2 className="pagina-estatica__seccion-titulo">Botones</h2>

          {/* Primarios */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Acciones primarias</p>
            <div className="sg-fila">
              <div className="sg-item">
                <BotonIniciarSesion />
                <span className="sg-etiqueta">IniciarSesion</span>
              </div>
              <div className="sg-item">
                <BotonIniciarSesion disabled />
                <span className="sg-etiqueta">disabled</span>
              </div>
              <div className="sg-item">
                <BotonRegistroLogin>Crear cuenta</BotonRegistroLogin>
                <span className="sg-etiqueta">RegistroLogin</span>
              </div>
              <div className="sg-item">
                <BotonRegistroLogin disabled>Crear cuenta</BotonRegistroLogin>
                <span className="sg-etiqueta">disabled</span>
              </div>
              <div className="sg-item">
                <BotonEmpezarAhora />
                <span className="sg-etiqueta">EmpezarAhora</span>
              </div>
              <div className="sg-item">
                <BotonEmpezarAhora disabled />
                <span className="sg-etiqueta">disabled</span>
              </div>
              <div className="sg-item">
                <BotonGenerarInforme />
                <span className="sg-etiqueta">GenerarInforme</span>
              </div>
              <div className="sg-item">
                <BotonGenerarInforme disabled />
                <span className="sg-etiqueta">disabled</span>
              </div>
            </div>
          </div>

          {/* Edición y eliminación */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Edición y eliminación</p>
            <div className="sg-fila">
              <div className="sg-item">
                <BotonEditar />
                <span className="sg-etiqueta">Editar</span>
              </div>
              <div className="sg-item">
                <BotonEditar disabled />
                <span className="sg-etiqueta">disabled</span>
              </div>
              <div className="sg-item">
                <BotonEliminar />
                <span className="sg-etiqueta">Eliminar</span>
              </div>
              <div className="sg-item">
                <BotonEliminar disabled />
                <span className="sg-etiqueta">disabled</span>
              </div>
            </div>
          </div>

          {/* Card almacén */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Card almacén</p>
            <div className="sg-fila">
              <div className="sg-item">
                <BotonCardAlmacen variante="ver-registro" />
                <span className="sg-etiqueta">ver-registro</span>
              </div>
              <div className="sg-item">
                <BotonCardAlmacen variante="ver-registro" disabled />
                <span className="sg-etiqueta">disabled</span>
              </div>
              <div className="sg-item">
                <BotonCardAlmacen variante="borrar" />
                <span className="sg-etiqueta">borrar</span>
              </div>
              <div className="sg-item">
                <BotonCardAlmacen variante="borrar" disabled />
                <span className="sg-etiqueta">disabled</span>
              </div>
            </div>
          </div>

          {/* Operaciones de perfil */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Operaciones de perfil</p>
            <div className="sg-fila">
              <div className="sg-item">
                <BotonOperacionesPerfil variante="cambiar-nombre" />
                <span className="sg-etiqueta">cambiar-nombre</span>
              </div>
              <div className="sg-item">
                <BotonOperacionesPerfil variante="cambiar-contrasenia" />
                <span className="sg-etiqueta">cambiar-contrasenia</span>
              </div>
              <div className="sg-item">
                <BotonOperacionesPerfil variante="cerrar-sesion" />
                <span className="sg-etiqueta">cerrar-sesion</span>
              </div>
              <div className="sg-item">
                <BotonOperacionesPerfil variante="cambiar-nombre" disabled />
                <span className="sg-etiqueta">disabled</span>
              </div>
            </div>
          </div>

          {/* Selección de rol */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Selección de rol (registro)</p>
            <div className="sg-fila">
              <div className="sg-item">
                <BotonRol
                  icon={<GestorIcon />}
                  titulo="Gestor"
                  descripcion="Gestiona el almacén y el semáforo"
                />
                <span className="sg-etiqueta">normal</span>
              </div>
              <div className="sg-item">
                <BotonRol
                  icon={<GestorIcon />}
                  titulo="Gestor"
                  descripcion="Gestiona el almacén y el semáforo"
                  active
                />
                <span className="sg-etiqueta">active</span>
              </div>
              <div className="sg-item">
                <BotonRol
                  icon={<OperadorIcon />}
                  titulo="Operador"
                  descripcion="Opera el escáner de contenedores"
                  off
                />
                <span className="sg-etiqueta">off</span>
              </div>
            </div>
          </div>

          {/* Roles de tarjeta de usuario */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Roles de tarjeta de usuario</p>
            <div className="sg-fila">
              <div className="sg-item">
                <BotonRolesCardUsuario rol="admin" />
                <span className="sg-etiqueta">admin</span>
              </div>
              <div className="sg-item">
                <BotonRolesCardUsuario rol="admin" seleccionado />
                <span className="sg-etiqueta">admin seleccionado</span>
              </div>
              <div className="sg-item">
                <BotonRolesCardUsuario rol="gestor" />
                <span className="sg-etiqueta">gestor</span>
              </div>
              <div className="sg-item">
                <BotonRolesCardUsuario rol="gestor" seleccionado />
                <span className="sg-etiqueta">gestor seleccionado</span>
              </div>
              <div className="sg-item">
                <BotonRolesCardUsuario rol="operador" />
                <span className="sg-etiqueta">operador</span>
              </div>
              <div className="sg-item">
                <BotonRolesCardUsuario rol="operador" active={false} />
                <span className="sg-etiqueta">off</span>
              </div>
            </div>
          </div>

          {/* Paginación */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Paginación</p>
            <div className="sg-fila">
              <div className="sg-item">
                <BotonCambioSeccion active>1</BotonCambioSeccion>
                <span className="sg-etiqueta">active</span>
              </div>
              <div className="sg-item">
                <BotonCambioSeccion>2</BotonCambioSeccion>
                <span className="sg-etiqueta">normal</span>
              </div>
              <div className="sg-item">
                <BotonCambioSeccion>3</BotonCambioSeccion>
                <span className="sg-etiqueta">normal</span>
              </div>
              <div className="sg-item">
                <BotonCambioSeccion disabled>4</BotonCambioSeccion>
                <span className="sg-etiqueta">disabled</span>
              </div>
            </div>
          </div>

          {/* Decisión binaria */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Decisión binaria (toggle visual)</p>
            <div className="sg-fila">
              <div className="sg-item sg-item--centrado">
                <BotonDecision label="Sin seleccionar" />
                <span className="sg-etiqueta">normal</span>
              </div>
              <div className="sg-item sg-item--centrado">
                <BotonDecision label="Seleccionado" selected />
                <span className="sg-etiqueta">selected</span>
              </div>
              <div className="sg-item sg-item--centrado">
                <BotonDecision label="Desactivado" disabled />
                <span className="sg-etiqueta">disabled</span>
              </div>
            </div>
          </div>

          {/* Cambiar tema */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Cambiar tema</p>
            <div className="sg-fila">
              <div className="sg-item">
                <BotonCambiarTema tema="light" onClick={NOOP} />
                <span className="sg-etiqueta">light → oscuro</span>
              </div>
              <div className="sg-item">
                <BotonCambiarTema tema="dark" onClick={NOOP} />
                <span className="sg-etiqueta">dark → claro</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            5. FORMULARIOS
        ══════════════════════════════════════════════════════════════ */}
        <section className="pagina-estatica__seccion pagina-estatica__seccion--ancha">
          <h2 className="pagina-estatica__seccion-titulo">Formularios</h2>

          {/* Input — estados */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Input — estados</p>
            <div className="sg-fila">
              <div className="sg-item" style={{ width: '15rem' }}>
                <Input
                  id="sg-inp-normal"
                  label="Correo"
                  placeholder="usuario@fluster.com"
                  value=""
                  onChange={NOOP}
                />
                <span className="sg-etiqueta">normal (vacío)</span>
              </div>
              <div className="sg-item" style={{ width: '15rem' }}>
                <Input
                  id="sg-inp-valor"
                  label="Correo"
                  value="gestor@fluster.com"
                  onChange={NOOP}
                />
                <span className="sg-etiqueta">con valor</span>
              </div>
              <div className="sg-item" style={{ width: '15rem' }}>
                <Input
                  id="sg-inp-error"
                  label="Correo"
                  value="no-es-email"
                  onChange={NOOP}
                  error="Introduce un correo válido"
                />
                <span className="sg-etiqueta">con error</span>
              </div>
              <div className="sg-item" style={{ width: '15rem' }}>
                <Input
                  id="sg-inp-hint"
                  label="Correo"
                  placeholder="usuario@fluster.com"
                  value=""
                  onChange={NOOP}
                  hint="Recibirás notificaciones aquí"
                />
                <span className="sg-etiqueta">con hint</span>
              </div>
              <div className="sg-item" style={{ width: '15rem' }}>
                <Input
                  id="sg-inp-disabled"
                  label="Correo"
                  value="gestor@fluster.com"
                  onChange={NOOP}
                  disabled
                />
                <span className="sg-etiqueta">disabled</span>
              </div>
            </div>
          </div>

          {/* InputContrasenia — estados */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">InputContrasenia — estados</p>
            <div className="sg-fila">
              <div className="sg-item" style={{ width: '15rem' }}>
                <InputContrasenia
                  id="sg-contra-normal"
                  label="Contraseña"
                  value=""
                  onChange={NOOP}
                />
                <span className="sg-etiqueta">normal (vacío)</span>
              </div>
              <div className="sg-item" style={{ width: '15rem' }}>
                <InputContrasenia
                  id="sg-contra-valor"
                  label="Contraseña"
                  value="micontrasenia123"
                  onChange={NOOP}
                />
                <span className="sg-etiqueta">con valor</span>
              </div>
              <div className="sg-item" style={{ width: '15rem' }}>
                <InputContrasenia
                  id="sg-contra-error"
                  label="Contraseña"
                  value=""
                  onChange={NOOP}
                  error="Mínimo 8 caracteres"
                />
                <span className="sg-etiqueta">con error</span>
              </div>
              <div className="sg-item" style={{ width: '15rem' }}>
                <InputContrasenia
                  id="sg-contra-disabled"
                  label="Contraseña"
                  value="micontrasenia123"
                  onChange={NOOP}
                  disabled
                />
                <span className="sg-etiqueta">disabled</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            6. FEEDBACK
        ══════════════════════════════════════════════════════════════ */}
        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Feedback</h2>

          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Spinner — tamaños</p>
            <div className="sg-fila">
              <div className="sg-item sg-item--centrado">
                <Spinner tamanio="sm" />
                <span className="sg-etiqueta">sm</span>
              </div>
              <div className="sg-item sg-item--centrado">
                <Spinner tamanio="md" />
                <span className="sg-etiqueta">md</span>
              </div>
              <div className="sg-item sg-item--centrado">
                <Spinner tamanio="lg" />
                <span className="sg-etiqueta">lg</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            7. ETIQUETAS Y BADGES
        ══════════════════════════════════════════════════════════════ */}
        <section className="pagina-estatica__seccion pagina-estatica__seccion--ancha">
          <h2 className="pagina-estatica__seccion-titulo">Etiquetas y badges</h2>

          {/* Rol asignado */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Rol asignado</p>
            <div className="sg-fila">
              {['admin', 'gestor', 'operador'].map(rol => (
                <div key={rol} className="sg-item">
                  <RolAsignado rol={rol} />
                  <span className="sg-etiqueta">{rol}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estado contenedor semáforo */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Estado de contenedor en semáforo — 7 estados</p>
            <div className="sg-fila">
              {[
                ['inactivo',        'Inactivo'],
                ['puerto-free',     'Puerto — Sin costes'],
                ['cliente-free',    'Cliente — Sin costes'],
                ['puerto-primer',   'Puerto — 1er tramo'],
                ['cliente-primer',  'Cliente — 1er tramo'],
                ['puerto-segundo',  'Puerto — 2º tramo'],
                ['cliente-segundo', 'Cliente — 2º tramo'],
              ].map(([estado, etiqueta]) => (
                <div key={estado} className="sg-item sg-item--centrado">
                  <EstadoContenedorSemaforo estado={estado} />
                  <span className="sg-etiqueta">{etiqueta}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cabecera de tramo */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Cabecera de tramo — 4 variantes</p>
            <div className="sg-fila">
              <div className="sg-item">
                <CabeceraTramo tramo="sin-coste"    cantidad={3}  />
                <span className="sg-etiqueta">sin-coste</span>
              </div>
              <div className="sg-item">
                <CabeceraTramo tramo="primer-tramo"  cantidad={7}  />
                <span className="sg-etiqueta">primer-tramo</span>
              </div>
              <div className="sg-item">
                <CabeceraTramo tramo="segundo-tramo" cantidad={2}  />
                <span className="sg-etiqueta">segundo-tramo</span>
              </div>
              <div className="sg-item">
                <CabeceraTramo tramo="inactivo"      cantidad={12} />
                <span className="sg-etiqueta">inactivo</span>
              </div>
            </div>
          </div>

          {/* Opción de filtro */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Opción de filtro</p>
            <div className="sg-fila">
              <div className="sg-item">
                <OpcionFiltro
                  label="Todas"
                  selected={filtroA}
                  onClick={() => setFiltroA(v => !v)}
                />
                <span className="sg-etiqueta">normal (click para seleccionar)</span>
              </div>
              <div className="sg-item">
                <OpcionFiltro
                  label="Activos"
                  selected={filtroB}
                  onClick={() => setFiltroB(v => !v)}
                />
                <span className="sg-etiqueta">seleccionada (click para deseleccionar)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            8. CARDS
        ══════════════════════════════════════════════════════════════ */}
        <section className="pagina-estatica__seccion pagina-estatica__seccion--ancha">
          <h2 className="pagina-estatica__seccion-titulo">Cards</h2>

          {/* Card almacén */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Card almacén — botón borrar habilitado / deshabilitado</p>
            <div className="sg-fila">
              <CardContenedoresAlmacen
                codigoBic="TGHU0123456"
                estado="INACTIVO"
                ultimaOperacion="12/05/2025"
                fechaInclusion="01/03/2025"
                operador="Carlos Reyes"
                onVerRegistro={NOOP}
                onBorrar={NOOP}
              />
              <CardContenedoresAlmacen
                codigoBic="MAEU9876543"
                estado="EN_PUERTO"
                ultimaOperacion="20/05/2025"
                fechaInclusion="15/04/2025"
                operador="Ana López"
                onVerRegistro={NOOP}
                onBorrar={NOOP}
              />
            </div>
          </div>

          {/* Card semáforo */}
          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Card semáforo — los 4 tramos</p>
            <div className="sg-fila">
              <CardSemaforo
                estado="inactivo"
                codigoBic="TGHU0123456"
                ultimaOperacion="05/01/2025"
                cliente={null}
                tarifaAcumulada={0}
                onAnterior={NOOP}
                onSiguiente={NOOP}
                onEditarFecha={NOOP}
              />
              <CardSemaforo
                estado="puerto-free"
                codigoBic="MSCU1234567"
                ultimaOperacion="10/05/2025"
                cliente="Importaciones García"
                tarifaAcumulada={0}
                onAnterior={NOOP}
                onSiguiente={NOOP}
                onEditarFecha={NOOP}
              />
              <CardSemaforo
                estado="cliente-primer"
                codigoBic="MAEU9876543"
                ultimaOperacion="02/05/2025"
                cliente="Transportes López"
                tarifaAcumulada={247.50}
                mostrarAnterior
                onAnterior={NOOP}
                onSiguiente={NOOP}
                onEditarFecha={NOOP}
              />
              <CardSemaforo
                estado="puerto-segundo"
                codigoBic="HLCU5551234"
                ultimaOperacion="28/04/2025"
                cliente="Logística Martínez"
                tarifaAcumulada={1820.00}
                mostrarAnterior
                onAnterior={NOOP}
                onSiguiente={NOOP}
                onEditarFecha={NOOP}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            9. BÚSQUEDA
        ══════════════════════════════════════════════════════════════ */}
        <section className="pagina-estatica__seccion">
          <h2 className="pagina-estatica__seccion-titulo">Búsqueda</h2>

          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Buscador de contenedores</p>
            <BuscadorCard
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onBuscar={NOOP}
              placeholder="Buscar por código BIC…"
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            10. CELDAS DE TABLA
        ══════════════════════════════════════════════════════════════ */}
        <section className="pagina-estatica__seccion pagina-estatica__seccion--ancha">
          <h2 className="pagina-estatica__seccion-titulo">Celdas de tabla</h2>

          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Tamaños — fuente heading</p>
            <div className="sg-fila">
              <div className="sg-item">
                <CeldaTabla label="Pequeña" tamanio="sm" />
                <span className="sg-etiqueta">sm</span>
              </div>
              <div className="sg-item">
                <CeldaTabla label="Mediana" tamanio="md" />
                <span className="sg-etiqueta">md</span>
              </div>
              <div className="sg-item">
                <CeldaTabla label="Naviera MAE" tamanio="naviera" />
                <span className="sg-etiqueta">naviera</span>
              </div>
            </div>
          </div>

          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Fuentes — tamaño md</p>
            <div className="sg-fila">
              <div className="sg-item">
                <CeldaTabla label="Crimson Text" tamanio="md" fuente="heading" />
                <span className="sg-etiqueta">heading</span>
              </div>
              <div className="sg-item">
                <CeldaTabla label="Poppins" tamanio="md" fuente="body" />
                <span className="sg-etiqueta">body</span>
              </div>
            </div>
          </div>

          <div className="sg-grupo">
            <p className="sg-grupo-titulo">Estados</p>
            <div className="sg-fila">
              <div className="sg-item">
                <CeldaTabla label="Estático" tamanio="md" />
                <span className="sg-etiqueta">estático</span>
              </div>
              <div className="sg-item">
                <CeldaTabla label="Solo lectura" tamanio="md" readonly />
                <span className="sg-etiqueta">readonly</span>
              </div>
              <div className="sg-item">
                <CeldaTabla
                  label={celdaValor}
                  tamanio="md"
                  editable
                  onChange={setCeldaValor}
                />
                <span className="sg-etiqueta">editable</span>
              </div>
            </div>
          </div>
        </section>

       
      </main>
    </>
  )
}

export default GuiaEstilos
