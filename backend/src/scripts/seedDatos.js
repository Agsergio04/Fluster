/**
 * Script de datos de prueba
 * Crea usuarios, navieras, clientes y contenedores (en distintos estados) para testing.
 * Es idempotente: omite registros que ya existen.
 *
 *   node src/scripts/seedDatos.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Usuario = require('../models/Usuario')
const Naviera = require('../models/Naviera')
const Cliente = require('../models/Cliente')
const Contenedor = require('../models/Contenedor')
const Ciclo = require('../models/Ciclo')
const Evento = require('../models/Evento')

function diasAtras(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function calcularCoste(diasTotales, diasLibres, tramos) {
  const diasFacturables = Math.max(0, diasTotales - diasLibres)
  if (diasFacturables === 0) return 0
  let coste = 0
  let restantes = diasFacturables
  for (const tramo of tramos) {
    if (restantes <= 0) break
    const finTramo = tramo.hastaDia ?? Infinity
    const diasEnTramo = Math.min(restantes, finTramo - tramo.desdeDia + 1)
    coste += diasEnTramo * tramo.precioPorDia
    restantes -= diasEnTramo
  }
  return coste
}

// ─────────────────────────────────────────────
//  Datos semilla
// ─────────────────────────────────────────────

const USUARIOS = [
  { nombre: 'Administrador',  correo: 'admin@fluster.com',      contrasena: 'Admin1234', rol: 'admin'    },
  { nombre: 'Gestor Uno',     correo: 'gestor1@fluster.com',    contrasena: 'Test1234',  rol: 'gestor'   },
  { nombre: 'Gestor Dos',     correo: 'gestor2@fluster.com',    contrasena: 'Test1234',  rol: 'gestor'   },
  { nombre: 'Operador Uno',   correo: 'operador1@fluster.com',  contrasena: 'Test1234',  rol: 'operador' },
  { nombre: 'Operador Dos',   correo: 'operador2@fluster.com',  contrasena: 'Test1234',  rol: 'operador' },
  { nombre: 'Operador Tres',  correo: 'operador3@fluster.com',  contrasena: 'Test1234',  rol: 'operador' },
]

const NAVIERAS = [
  {
    nombre: 'Maersk', codigo: 'MAEU',
    diasLibresDemurrage: 5, diasLibresDetention: 7,
    diasDemurrage: [
      { desdeDia: 1,  hastaDia: 5,    precioPorDia: 50  },
      { desdeDia: 6,  hastaDia: 10,   precioPorDia: 80  },
      { desdeDia: 11, hastaDia: null, precioPorDia: 120 },
    ],
    diasDetention: [
      { desdeDia: 1,  hastaDia: 7,    precioPorDia: 40  },
      { desdeDia: 8,  hastaDia: 14,   precioPorDia: 65  },
      { desdeDia: 15, hastaDia: null, precioPorDia: 100 },
    ],
  },
  {
    nombre: 'MSC', codigo: 'MSCU',
    diasLibresDemurrage: 7, diasLibresDetention: 5,
    diasDemurrage: [
      { desdeDia: 1,  hastaDia: 7,    precioPorDia: 45  },
      { desdeDia: 8,  hastaDia: 14,   precioPorDia: 70  },
      { desdeDia: 15, hastaDia: null, precioPorDia: 110 },
    ],
    diasDetention: [
      { desdeDia: 1,  hastaDia: 5,    precioPorDia: 35  },
      { desdeDia: 6,  hastaDia: 10,   precioPorDia: 60  },
      { desdeDia: 11, hastaDia: null, precioPorDia: 95  },
    ],
  },
  {
    nombre: 'CMA CGM', codigo: 'CMAU',
    diasLibresDemurrage: 4, diasLibresDetention: 6,
    diasDemurrage: [
      { desdeDia: 1,  hastaDia: 4,    precioPorDia: 55  },
      { desdeDia: 5,  hastaDia: 10,   precioPorDia: 90  },
      { desdeDia: 11, hastaDia: null, precioPorDia: 130 },
    ],
    diasDetention: [
      { desdeDia: 1,  hastaDia: 6,    precioPorDia: 45  },
      { desdeDia: 7,  hastaDia: 12,   precioPorDia: 70  },
      { desdeDia: 13, hastaDia: null, precioPorDia: 105 },
    ],
  },
]

const CLIENTES_SEED = [
  { nombre: 'Acme Logistics'      },
  { nombre: 'Tech Global Freight' },
  { nombre: 'Iberia Cargo'        },
]

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

async function upsertUsuario(u) {
  const existe = await Usuario.findOne({ correo: u.correo })
  if (existe) { console.log(`  [skip] ${u.correo}`); return existe }
  const hash = await bcrypt.hash(u.contrasena, 10)
  const nuevo = await Usuario.create({ ...u, contrasena: hash })
  console.log(`  [ok]   ${u.correo} (${u.rol})`)
  return nuevo
}

async function upsertNaviera(n) {
  const existe = await Naviera.findOne({ codigo: n.codigo })
  if (existe) { console.log(`  [skip] ${n.nombre}`); return existe }
  const nueva = await Naviera.create(n)
  console.log(`  [ok]   ${n.nombre} (${n.codigo})`)
  return nueva
}

async function upsertCliente(c) {
  const existe = await Cliente.findOne({ nombre: c.nombre })
  if (existe) { console.log(`  [skip] ${c.nombre}`); return existe }
  const nuevo = await Cliente.create(c)
  console.log(`  [ok]   ${c.nombre}`)
  return nuevo
}

async function upsertContenedor(datos, correoCreador) {
  const existe = await Contenedor.findOne({ codigoBIC: datos.codigoBIC })
  if (existe) { console.log(`  [skip] ${datos.codigoBIC}`); return existe }
  const nuevo = await Contenedor.create(datos)
  console.log(`  [ok]   ${datos.codigoBIC} — estado: ${datos.estado}, creado por: ${correoCreador}`)
  return nuevo
}

// Construye los datos de un ciclo completamente cerrado y con costes calculados.
// entradaDias / salidaDias / devolucionDias = días hacia atrás desde hoy.
function cicloCerrado(contenedorId, clienteId, naviera, entradaDias, salidaDias, devolucionDias) {
  const demDias = entradaDias - salidaDias
  const detDias = salidaDias - devolucionDias
  const demCoste = calcularCoste(demDias, naviera.diasLibresDemurrage, naviera.diasDemurrage)
  const detCoste = calcularCoste(detDias, naviera.diasLibresDetention, naviera.diasDetention)
  return {
    contenedorId, clienteId,
    demurrage: {
      diasLibres: naviera.diasLibresDemurrage,
      fechaInicio: diasAtras(entradaDias), fechaFin: diasAtras(salidaDias),
      diasTranscurridos: demDias,
      diasFacturables: Math.max(0, demDias - naviera.diasLibresDemurrage),
      costeTotal: demCoste,
    },
    detention: {
      diasLibres: naviera.diasLibresDetention,
      fechaInicio: diasAtras(salidaDias), fechaFin: diasAtras(devolucionDias),
      diasTranscurridos: detDias,
      diasFacturables: Math.max(0, detDias - naviera.diasLibresDetention),
      costeTotal: detCoste,
    },
    costeTotal: demCoste + detCoste,
    fechaCierre: diasAtras(devolucionDias),
  }
}

async function upsertEvento(contenedorId, tipo, timestamp, registradoPor) {
  const existe = await Evento.findOne({ contenedorId, tipo })
  if (existe) { console.log(`  [skip] evento ${tipo} para ${contenedorId}`); return }
  await Evento.create({ contenedorId, tipo, timestamp, registradoPor, ocrValidado: false })
  console.log(`  [ok]   evento ${tipo} para contenedor ${contenedorId}`)
}

async function upsertCiclo(contenedorId, datos) {
  const existe = await Ciclo.findOne({ contenedorId, fechaCierre: datos.fechaCierre ?? null })
  if (existe) { console.log(`  [skip] ciclo para ${contenedorId}`); return }
  await Ciclo.create(datos)
  console.log(`  [ok]   ciclo para contenedor ${contenedorId}`)
}

// ─────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Conectado a MongoDB\n')

  // Usuarios
  console.log('=== Usuarios ===')
  const U = {}
  for (const u of USUARIOS) U[u.correo] = await upsertUsuario(u)

  // Navieras
  console.log('\n=== Navieras ===')
  const N = {}
  for (const n of NAVIERAS) N[n.codigo] = await upsertNaviera(n)

  // Clientes
  console.log('\n=== Clientes ===')
  const C = {}
  for (const c of CLIENTES_SEED) C[c.nombre] = await upsertCliente(c)

  // Alias cortos
  const op1 = U['operador1@fluster.com']
  const op2 = U['operador2@fluster.com']
  const op3 = U['operador3@fluster.com']
  const maeu = N['MAEU'], mscu = N['MSCU'], cmau = N['CMAU']
  const cl1 = C['Acme Logistics'], cl2 = C['Tech Global Freight'], cl3 = C['Iberia Cargo']

  // ── Contenedores ───────────────────────────
  console.log('\n=== Contenedores ===')

  // 1. INACTIVO — recién registrado, sin ciclo
  const c1 = await upsertContenedor({
    codigoBIC: 'MAEU1234567', tipo: '20DC', estado: 'INACTIVO',
    navieraId: maeu._id, fechaInicioLibre: diasAtras(2), creadoPor: op1._id,
  }, 'operador1@fluster.com')

  // 2. INACTIVO — recién registrado, sin ciclo
  const c2 = await upsertContenedor({
    codigoBIC: 'MSCU7654321', tipo: '40HC', estado: 'INACTIVO',
    navieraId: mscu._id, fechaInicioLibre: diasAtras(1), creadoPor: op2._id,
  }, 'operador2@fluster.com')

  // 3. PUERTO — 8 días en puerto (supera 5 días libres de Maersk → acumula demurrage)
  const c3 = await upsertContenedor({
    codigoBIC: 'MAEU2345678', tipo: '40DC', estado: 'PUERTO',
    navieraId: maeu._id, fechaInicioLibre: diasAtras(12),
    fechaEntradaPuerto: diasAtras(8), creadoPor: op1._id,
  }, 'operador1@fluster.com')

  // 4. PUERTO — 4 días en puerto (dentro de los 7 días libres de MSC → sin coste aún)
  const c4 = await upsertContenedor({
    codigoBIC: 'MSCU3456789', tipo: '20DC', estado: 'PUERTO',
    navieraId: mscu._id, fechaInicioLibre: diasAtras(10),
    fechaEntradaPuerto: diasAtras(4), creadoPor: op3._id,
  }, 'operador3@fluster.com')

  // 5. CLIENTE — 5 días con cliente (dentro de los 6 días libres CMA CGM → sin coste aún)
  const c5 = await upsertContenedor({
    codigoBIC: 'CMAU1234567', tipo: '40HC', estado: 'CLIENTE',
    navieraId: cmau._id, fechaInicioLibre: diasAtras(20),
    fechaEntradaPuerto: diasAtras(15), fechaSalidaPuerto: diasAtras(5),
    creadoPor: op2._id,
  }, 'operador2@fluster.com')

  // 6. CLIENTE — 10 días con cliente (supera 7 días libres de Maersk → acumula detention)
  const c6 = await upsertContenedor({
    codigoBIC: 'MAEU4567890', tipo: '20DC', estado: 'CLIENTE',
    navieraId: maeu._id, fechaInicioLibre: diasAtras(25),
    fechaEntradaPuerto: diasAtras(18), fechaSalidaPuerto: diasAtras(10),
    creadoPor: op3._id,
  }, 'operador3@fluster.com')

  // 7. INACTIVO — ciclo completado (MSC, coste finalizado)
  const c7 = await upsertContenedor({
    codigoBIC: 'MSCU5678901', tipo: '40DC', estado: 'INACTIVO',
    navieraId: mscu._id, fechaInicioLibre: diasAtras(45),
    fechaEntradaPuerto: diasAtras(40), fechaSalidaPuerto: diasAtras(25),
    fechaDevolucion: diasAtras(5), creadoPor: op1._id,
  }, 'operador1@fluster.com')

  // 8. INACTIVO — ciclo completado (CMA CGM, coste finalizado)
  const c8 = await upsertContenedor({
    codigoBIC: 'CMAU9876543', tipo: '40HC', estado: 'INACTIVO',
    navieraId: cmau._id, fechaInicioLibre: diasAtras(60),
    fechaEntradaPuerto: diasAtras(55), fechaSalidaPuerto: diasAtras(40),
    fechaDevolucion: diasAtras(15), creadoPor: op2._id,
  }, 'operador2@fluster.com')

  // ── Ciclos ─────────────────────────────────
  console.log('\n=== Ciclos ===')

  // ── MAEU1234567 (INACTIVO) — 2 ciclos históricos completados
  await upsertCiclo(c1._id, cicloCerrado(c1._id, cl1._id, maeu, 120, 100, 85))  // dem=20d det=15d
  await upsertCiclo(c1._id, cicloCerrado(c1._id, cl2._id, maeu,  70,  58, 45))  // dem=12d det=13d

  // ── MSCU7654321 (INACTIVO) — 2 ciclos históricos completados
  await upsertCiclo(c2._id, cicloCerrado(c2._id, cl2._id, mscu, 110,  95, 80))  // dem=15d det=15d
  await upsertCiclo(c2._id, cicloCerrado(c2._id, cl3._id, mscu,  60,  50, 38))  // dem=10d det=12d

  // ── MAEU2345678 (PUERTO) — 2 ciclos cerrados + ciclo activo en demurrage
  await upsertCiclo(c3._id, cicloCerrado(c3._id, cl3._id, maeu, 160, 140, 120)) // dem=20d det=20d
  await upsertCiclo(c3._id, cicloCerrado(c3._id, cl1._id, maeu, 100,  82,  65)) // dem=18d det=17d
  await upsertCiclo(c3._id, {
    contenedorId: c3._id, clienteId: cl2._id,
    demurrage: { diasLibres: maeu.diasLibresDemurrage, fechaInicio: diasAtras(8), fechaFin: null },
    detention: null,
  })

  // ── MSCU3456789 (PUERTO) — 1 ciclo cerrado + ciclo activo en demurrage
  await upsertCiclo(c4._id, cicloCerrado(c4._id, cl1._id, mscu, 130, 115,  98)) // dem=15d det=17d
  await upsertCiclo(c4._id, {
    contenedorId: c4._id, clienteId: cl2._id,
    demurrage: { diasLibres: mscu.diasLibresDemurrage, fechaInicio: diasAtras(4), fechaFin: null },
    detention: null,
  })

  // ── CMAU1234567 (CLIENTE) — 2 ciclos cerrados + ciclo activo en detention
  await upsertCiclo(c5._id, cicloCerrado(c5._id, cl3._id, cmau, 150, 130, 110)) // dem=20d det=20d
  await upsertCiclo(c5._id, cicloCerrado(c5._id, cl2._id, cmau,  90,  75,  58)) // dem=15d det=17d
  {
    const demDias = 10, demLibres = cmau.diasLibresDemurrage
    await upsertCiclo(c5._id, {
      contenedorId: c5._id, clienteId: cl1._id,
      demurrage: {
        diasLibres: demLibres, fechaInicio: diasAtras(15), fechaFin: diasAtras(5),
        diasTranscurridos: demDias, diasFacturables: Math.max(0, demDias - demLibres),
        costeTotal: calcularCoste(demDias, demLibres, cmau.diasDemurrage),
      },
      detention: { diasLibres: cmau.diasLibresDetention, fechaInicio: diasAtras(5), fechaFin: null },
    })
  }

  // ── MAEU4567890 (CLIENTE) — 1 ciclo cerrado + ciclo activo en detention
  await upsertCiclo(c6._id, cicloCerrado(c6._id, cl2._id, maeu, 160, 140, 120)) // dem=20d det=20d
  {
    const demDias = 8, demLibres = maeu.diasLibresDemurrage
    await upsertCiclo(c6._id, {
      contenedorId: c6._id, clienteId: cl3._id,
      demurrage: {
        diasLibres: demLibres, fechaInicio: diasAtras(18), fechaFin: diasAtras(10),
        diasTranscurridos: demDias, diasFacturables: Math.max(0, demDias - demLibres),
        costeTotal: calcularCoste(demDias, demLibres, maeu.diasDemurrage),
      },
      detention: { diasLibres: maeu.diasLibresDetention, fechaInicio: diasAtras(10), fechaFin: null },
    })
  }

  // ── MSCU5678901 (INACTIVO) — 2 ciclos históricos + ciclo reciente ya cerrado
  await upsertCiclo(c7._id, cicloCerrado(c7._id, cl1._id, mscu, 200, 178, 155)) // dem=22d det=23d
  await upsertCiclo(c7._id, cicloCerrado(c7._id, cl3._id, mscu, 130, 112,  95)) // dem=18d det=17d
  await upsertCiclo(c7._id, cicloCerrado(c7._id, cl2._id, mscu,  40,  25,   5)) // dem=15d det=20d

  // ── CMAU9876543 (INACTIVO) — 2 ciclos históricos + ciclo reciente ya cerrado
  await upsertCiclo(c8._id, cicloCerrado(c8._id, cl2._id, cmau, 250, 225, 200)) // dem=25d det=25d
  await upsertCiclo(c8._id, cicloCerrado(c8._id, cl1._id, cmau, 165, 147, 130)) // dem=18d det=17d
  await upsertCiclo(c8._id, cicloCerrado(c8._id, cl3._id, cmau,  55,  40,  15)) // dem=15d det=25d

  // ── Eventos ────────────────────────────────
  console.log('\n=== Eventos ===')

  // MAEU2345678 — PUERTO: solo entrada_puerto
  await upsertEvento(c3._id, 'entrada_puerto', diasAtras(8), op1._id)

  // MSCU3456789 — PUERTO: solo entrada_puerto
  await upsertEvento(c4._id, 'entrada_puerto', diasAtras(4), op3._id)

  // CMAU1234567 — CLIENTE: entrada + salida_puerto
  await upsertEvento(c5._id, 'entrada_puerto', diasAtras(15), op2._id)
  await upsertEvento(c5._id, 'salida_puerto',  diasAtras(5),  op2._id)

  // MAEU4567890 — CLIENTE: entrada + salida_puerto
  await upsertEvento(c6._id, 'entrada_puerto', diasAtras(18), op3._id)
  await upsertEvento(c6._id, 'salida_puerto',  diasAtras(10), op3._id)

  // MSCU5678901 — INACTIVO completado: ciclo completo de eventos
  await upsertEvento(c7._id, 'entrada_puerto',  diasAtras(40), op1._id)
  await upsertEvento(c7._id, 'salida_puerto',   diasAtras(25), op1._id)
  await upsertEvento(c7._id, 'llegada_almacen', diasAtras(24), op1._id)
  await upsertEvento(c7._id, 'devolucion',      diasAtras(5),  op1._id)

  // CMAU9876543 — INACTIVO completado: ciclo completo de eventos
  await upsertEvento(c8._id, 'entrada_puerto',  diasAtras(55), op2._id)
  await upsertEvento(c8._id, 'salida_puerto',   diasAtras(40), op2._id)
  await upsertEvento(c8._id, 'llegada_almacen', diasAtras(39), op2._id)
  await upsertEvento(c8._id, 'devolucion',      diasAtras(15), op2._id)

  // ─────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════')
  console.log('  Seed completado')
  console.log('══════════════════════════════════════════')
  console.log('\nCredenciales:')
  console.log('  admin@fluster.com      Admin1234   [admin]')
  console.log('  gestor1@fluster.com    Test1234    [gestor]')
  console.log('  gestor2@fluster.com    Test1234    [gestor]')
  console.log('  operador1@fluster.com  Test1234    [operador]')
  console.log('  operador2@fluster.com  Test1234    [operador]')
  console.log('  operador3@fluster.com  Test1234    [operador]')
  console.log('\nContenedores creados:')
  console.log('  MAEU1234567  INACTIVO  (op1) — sin ciclo')
  console.log('  MSCU7654321  INACTIVO  (op2) — sin ciclo')
  console.log('  MAEU2345678  PUERTO   (op1) — demurrage activo (8 días, >5 libres)')
  console.log('  MSCU3456789  PUERTO   (op3) — demurrage activo (4 días, dentro de libres)')
  console.log('  CMAU1234567  CLIENTE   (op2) — detention activa (5 días, dentro de libres)')
  console.log('  MAEU4567890  CLIENTE   (op3) — detention activa (10 días, >7 libres)')
  console.log('  MSCU5678901  INACTIVO  (op1) — ciclo cerrado con costes')
  console.log('  CMAU9876543  INACTIVO  (op2) — ciclo cerrado con costes')

  await mongoose.disconnect()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
