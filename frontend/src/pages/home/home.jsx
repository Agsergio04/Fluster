import { useState } from 'react'
import './home.scss'
import Input from '../../components/atomos/Input'
import InputContrasenia from '../../components/atomos/InputContrasenia'
import BotonRegistroLogin from '../../components/atomos/BotonRegistroLogin'
import BotonCambioRegistroLogin from '../../components/atomos/BotonCambioRegistroLogin'
import BotonRol from '../../components/atomos/BotonRol'
import BotonAccionTarifa from '../../components/atomos/BotonAccionTarifa'
import BotonGenerarInforme from '../../components/atomos/BotonGenerarInforme'
import BotonEliminar from '../../components/atomos/BotonEliminar'
import BotonEditar from '../../components/atomos/BotonEditar'
import BotonEditarCardFecha from '../../components/atomos/BotonEditarCardFecha'
import BotonCambioSeccion from '../../components/atomos/BotonCambioSeccion'
import BotonIrIzquierda from '../../components/atomos/BotonIrIzquierda'
import BotonIrDerecha from '../../components/atomos/BotonIrDerecha'
import BotonBusqueda from '../../components/atomos/BotonBusqueda'
import BotonDecision from '../../components/atomos/BotonDecision'
import BotonEditadoFechaContenedor from '../../components/atomos/BotonEditadoFechaContenedor'
import BotonSeleccionarFoto from '../../components/atomos/BotonSeleccionarFoto'
import BotonEmpezarAhora from '../../components/atomos/BotonEmpezarAhora'
import BotonIniciarSesion from '../../components/atomos/BotonIniciarSesion'
import BotonMenuHamburguesa from '../../components/atomos/BotonMenuHamburguesa'
import BotonCambiarTema from '../../components/atomos/BotonCambiarTema'
import BotonDesplegableHamburguesa from '../../components/atomos/BotonDesplegableHamburguesa'
import TarjetaCicloContenedor from '../../components/moleculas/TarjetaCicloContenedor'
import EstadoContenedorSemaforo from '../../components/atomos/EstadoContenedorSemaforo'
import ContenedoresFotoIcon from '../../assets/icons/Icono de contenedores por foto.svg?react'
import TarifasIcon from '../../assets/icons/Icono Tarifas.svg?react'
import GestorIcon from '../../assets/icons/Icono Gestor.svg?react'
import OperadorIcon from '../../assets/icons/Icono Operador.svg?react'
import ContenedoresIcon from '../../assets/icons/Icono contenedores.svg?react'
import PanelControlIcon from '../../assets/icons/Icono panel de control.svg?react'
import PerfilIcon from '../../assets/icons/Icono Perfil.svg?react'
import BotonBorrarUsuario from '../../components/atomos/BotonBorrarUsuario'
import BotonCambiarEstado from '../../components/atomos/BotonCambiarEstado'
import RolAsignado from '../../components/atomos/RolAsignado'
import BotonRolesCardUsuario from '../../components/atomos/BotonRolesCardUsuario'
import BuscadorCard from '../../components/moleculas/BuscadorCard'
import CabeceraTramo from '../../components/atomos/CabeceraTramo'
import CabeceraHeader from '../../components/moleculas/CabeceraHeader'
import CabeceraSemaforoCard from '../../components/moleculas/CabeceraSemaforoCard'
import TextoConEntradaDatos from '../../components/moleculas/TextoConEntradaDatos'
import TextoCambiadorLoginRegistro from '../../components/moleculas/TextoCambiadorLoginRegistro'
import TextoCambiadorRegistroLogin from '../../components/moleculas/TextoCambiadorRegistroLogin'
import BotonesMovimientoCard from '../../components/moleculas/BotonesMovimientoCard'
import CardUsuario from '../../components/moleculas/CardUsuario'
import CardSemaforo from '../../components/organismos/CardSemaforo'
import CardContenedoresAlmacen from '../../components/moleculas/CardContenedoresAlmacen'
import BotonCardAlmacen from '../../components/atomos/BotonCardAlmacen'

function Home() {
  const [tab, setTab] = useState('login')
  return (
    <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>Home</h1>

      <BuscadorCard value="" onChange={() => {}} onBuscar={() => {}} />

      <CabeceraTramo tramo="sin-coste"     cantidad={32} />
      <CabeceraTramo tramo="primer-tramo"  cantidad={14} />
      <CabeceraTramo tramo="segundo-tramo" cantidad={7}  />
      <CabeceraTramo tramo="inactivo"      cantidad={5}  />

      <CabeceraSemaforoCard estado="inactivo" onSiguiente={() => {}} />
      <CabeceraSemaforoCard estado="puerto-free" mostrarAnterior onAnterior={() => {}} onSiguiente={() => {}} />
      <CabeceraSemaforoCard estado="cliente-primer" mostrarAnterior onAnterior={() => {}} onSiguiente={() => {}} />
      <CabeceraSemaforoCard estado="puerto-segundo" mostrarAnterior onAnterior={() => {}} mostrarSiguiente={false} />

      <CabeceraHeader tema="light" onToggleTema={() => {}} />
      <CabeceraHeader loggeado tema="light" onToggleTema={() => {}} onMenuHamburguesa={() => {}} />
      <CabeceraHeader loggeado tema="dark" onToggleTema={() => {}} onMenuHamburguesa={() => {}} />

      <Input
        id="email"
        label="Correo electrónico"
        type="string"
        placeholder="Introduce tu correo"
        value=""
        onChange={() => {}}
        required
        error="Correo no válido"
        hint="Ejemplo: usuario@dominio.com"
      />

      <InputContrasenia
        id="password"
        label="Contraseña"
        required
        size="lg"
      />

      <InputContrasenia
        id="password-error"
        label="Contraseña con error"
        error="La contraseña es incorrecta"
        required
      />

      <BotonRegistroLogin>Registrarse</BotonRegistroLogin>
      <BotonRegistroLogin>Iniciar Sesión</BotonRegistroLogin>
      <BotonRegistroLogin disabled>Registrarse</BotonRegistroLogin>

      <BotonCambioRegistroLogin active={tab} onChange={setTab} />

      <BotonRol
        icon={<GestorIcon aria-hidden="true" />}
        titulo="Soy Gestor de Operaciones"
        descripcion="Controlo tarifas de navieras, gestiono los contenedores y genero los informes"
      />
      <BotonRol
        icon={<GestorIcon aria-hidden="true" />}
        titulo="Soy Gestor de Operaciones"
        descripcion="Controlo tarifas de navieras, gestiono los contenedores y genero los informes"
        active
      />
      <BotonRol
        icon={<OperadorIcon aria-hidden="true" />}
        titulo="Soy un Operador"
        descripcion="Introduzco contenedores mediante un sistema OCR"
      />
      <BotonRol
        icon={<OperadorIcon aria-hidden="true" />}
        titulo="Soy un Operador"
        descripcion="Introduzco contenedores mediante un sistema OCR"
        active
      />

      <TextoCambiadorLoginRegistro
        texto="¿No tienes cuenta?"
        labelBoton="Registrarse"
        onClick={() => {}}
      />
      <TextoCambiadorLoginRegistro
        texto="¿Ya tienes cuenta?"
        labelBoton="Iniciar sesión"
        onClick={() => {}}
      />
      <TextoCambiadorRegistroLogin
        texto="Tienes una cuenta"
        labelBoton="Iniciar sesión"
        onClick={() => {}}
      />

      <BotonGenerarInforme onClick={() => {}}/>
      <BotonGenerarInforme disabled />

      <BotonAccionTarifa accion="eliminar" onClick={() => {}} />
      <BotonAccionTarifa accion="eliminar" disabled />

      <BotonAccionTarifa accion="actualizar" onClick={() => {}} />
      <BotonAccionTarifa accion="actualizar" disabled />

      <BotonEliminar onClick={() => {}} />
      <BotonEliminar disabled size="md"/>

      <BotonEditar onClick={() => {}} />
      <BotonEditar disabled />

      <BotonEditarCardFecha onClick={() => {}} />
      <BotonEditarCardFecha disabled />

      <BotonCambioSeccion onClick={() => {}}>1</BotonCambioSeccion>
      <BotonCambioSeccion active onClick={() => {}}>2</BotonCambioSeccion>
      <BotonCambioSeccion disabled>3</BotonCambioSeccion>

      <BotonIrIzquierda onClick={() => {}} />
      <BotonIrIzquierda disabled />

      <BotonIrDerecha onClick={() => {}} />
      <BotonIrDerecha disabled />

      <BotonBusqueda onClick={() => {}} />
      <BotonBusqueda disabled />

      <BotonDecision onClick={() => {}} />
      <BotonDecision selected onClick={() => {}} />
      <BotonDecision disabled />

      <BotonEditadoFechaContenedor onClick={() => {}} />
      <BotonEditadoFechaContenedor disabled />

      <BotonSeleccionarFoto onClick={() => {}} />
      <BotonSeleccionarFoto disabled />

      <BotonEmpezarAhora onClick={() => {}} />
      <BotonEmpezarAhora disabled />

      <BotonIniciarSesion onClick={() => {}} />
      <BotonIniciarSesion disabled />

      <BotonMenuHamburguesa onClick={() => {}} />
      <BotonMenuHamburguesa disabled />

      <BotonCambiarTema theme="light" onClick={() => {}} />
      <BotonCambiarTema theme="dark" onClick={() => {}} />

      <BotonDesplegableHamburguesa icon={<ContenedoresFotoIcon />} label="Meter contenedor" onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<TarifasIcon />} label="Tarifas" onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<GestorIcon />} label="Seguimiento" active onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<ContenedoresIcon />} label="Almacen" onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<ContenedoresIcon />} label="Contenedores" onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<PanelControlIcon />} label="Panel de control" onClick={() => {}} />
      <BotonDesplegableHamburguesa icon={<PerfilIcon />} label="Perfil" disabled />

      <TarjetaCicloContenedor
        cliente="Empresa Ejemplo S.L."
        demurrage={{ fechaInicio: '01/03/2024', fechaFin: '05/03/2024', coste: 320 }}
        detention={{ fechaInicio: '06/03/2024', fechaFin: '10/03/2024', coste: 180 }}
        onEditarDemurrage={() => {}}
        onEditarDetention={() => {}}
      />

      <TextoConEntradaDatos
        id="filtro-bic"
        label="Filtrado por el codigo Bic"
        placeholder="Introduce el codigo Bic"
        value=""
        onChange={() => {}}
      />
      <TextoConEntradaDatos
        id="filtro-naviera"
        label="Filtrado por la naviera"
        placeholder="Introduce la naviera"
        value=""
        onChange={() => {}}
      />
      <TextoConEntradaDatos
        id="filtro-cliente"
        label="Filtrado por el nombre del cliente"
        placeholder="Introduce el nombre del cliente"
        value=""
        onChange={() => {}}
      />

      <RolAsignado rol="admin" />
      <RolAsignado rol="gestor" />
      <RolAsignado rol="operador" />

      <BotonCambiarEstado onAnterior={() => {}} onSiguiente={() => {}} />
      <BotonCambiarEstado onSiguiente={() => {}} />
      <BotonCambiarEstado onAnterior={() => {}} />
      <BotonCambiarEstado mostrarAnterior={false} onSiguiente={() => {}} />
      <BotonCambiarEstado mostrarAnterior={false} mostrarSiguiente={false} />

      <BotonBorrarUsuario onClick={() => {}} />
      <BotonBorrarUsuario disabled />

      <BotonRolesCardUsuario rol="admin" />
      <BotonRolesCardUsuario rol="gestor" />
      <BotonRolesCardUsuario rol="operador" />
      <BotonRolesCardUsuario rol="admin" active={false} />

      <EstadoContenedorSemaforo estado="inactivo" />
      <EstadoContenedorSemaforo estado="puerto-free" />
      <EstadoContenedorSemaforo estado="cliente-free" />
      <EstadoContenedorSemaforo estado="puerto-primer" />
      <EstadoContenedorSemaforo estado="cliente-primer" />
      <EstadoContenedorSemaforo estado="puerto-segundo" />
      <EstadoContenedorSemaforo estado="cliente-segundo" />

      <BotonesMovimientoCard paginaActual={1} totalPaginas={5} onCambiarPagina={() => {}} />
      <BotonesMovimientoCard paginaActual={3} totalPaginas={5} onCambiarPagina={() => {}} />
      <BotonesMovimientoCard paginaActual={5} totalPaginas={5} onCambiarPagina={() => {}} />

      <CardSemaforo
        estado="inactivo"
        codigoBic="BLKU 1266960"
        ultimaOperacion="27/03/2026"
        onSiguiente={() => {}}
        onEditarFecha={() => {}}
      />
      <CardSemaforo
        estado="cliente-free"
        codigoBic="BLKU 1266960"
        ultimaOperacion="27/03/2026"
        cliente="Logistica Mediterranea LS"
        tarifaAcumulada={75.00}
        mostrarAnterior
        onAnterior={() => {}}
        onSiguiente={() => {}}
        onEditarFecha={() => {}}
      />
      <CardSemaforo
        estado="puerto-primer"
        codigoBic="BLKU 1266960"
        ultimaOperacion="27/03/2026"
        cliente="Logistica Mediterranea LS"
        tarifaAcumulada={25.00}
        mostrarAnterior
        onAnterior={() => {}}
        onSiguiente={() => {}}
        onEditarFecha={() => {}}
      />
      <CardSemaforo
        estado="puerto-segundo"
        codigoBic="BLKU 1266960"
        ultimaOperacion="27/03/2026"
        cliente="Logistica Mediterranea LS"
        tarifaAcumulada={25.00}
        mostrarAnterior
        onAnterior={() => {}}
        mostrarSiguiente={false}
        onEditarFecha={() => {}}
      />

      <CardUsuario
        nombre="Sergio Aragón García"
        correo="sergioaragon@gmail.com"
        rol="operador"
        onCambiarRol={() => {}}
        onEliminar={() => {}}
      />
      <CardUsuario
        nombre="Sergio Aragón García"
        correo="sergioaragon@gmail.com"
        rol="gestor"
        onCambiarRol={() => {}}
        onEliminar={() => {}}
      />
      <CardUsuario
        nombre="Sergio Aragón García"
        correo="sergioaragon@gmail.com"
        rol="admin"
        onCambiarRol={() => {}}
        onEliminar={() => {}}
      />

      <BotonCardAlmacen variante="ver-registro" onClick={() => {}} />
      <BotonCardAlmacen variante="borrar" onClick={() => {}} />
      <BotonCardAlmacen variante="ver-registro" disabled />
      <BotonCardAlmacen variante="borrar" disabled />

      <CardContenedoresAlmacen
        codigoBic="BLKU 1266960"
        ultimaOperacion="27/03/2026"
        fechaInclusion="11/02/2020"
        operador="Mario Casas Vaquerizo"
        onVerRegistro={() => {}}
        onBorrar={() => {}}
      />
      <CardContenedoresAlmacen
        codigoBic="MSCU 8374210"
        ultimaOperacion="15/01/2026"
        fechaInclusion="03/06/2021"
        operador="Laura Fernández Ruiz"
        onVerRegistro={() => {}}
        onBorrar={() => {}}
      />
    </main>
  )
}

export default Home
