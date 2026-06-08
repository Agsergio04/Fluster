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
  { nombre: 'Sergio Aragón García', correo: 'sergioaragongarcia@gmail.com', contrasena: 'Sergio1234', rol: 'admin', protegido: true },
  { nombre: 'Administrador',  correo: 'admin@fluster.com',      contrasena: 'Admin1234', rol: 'admin'    },
  { nombre: 'Luis García',    correo: 'luis@gmail.com',         contrasena: 'luis',  rol: 'gestor'   },
  { nombre: 'Gestor Dos',     correo: 'gestor2@fluster.com',    contrasena: 'Test1234',  rol: 'gestor'   },
  { nombre: 'María López',    correo: 'marilopez@gmail.com',    contrasena: 'maria',  rol: 'operador' },
  { nombre: 'Operador Dos',   correo: 'operador2@fluster.com',  contrasena: 'Test1234',  rol: 'operador' },
  { nombre: 'Operador Tres',  correo: 'operador3@fluster.com',  contrasena: 'Test1234',  rol: 'operador' },
  // Cuentas de prueba para el profesorado (ver README → «Pruebas para el profesorado»)
  { nombre: 'Juan José Arias', correo: 'juanjoseariaslozano@gmail.com', contrasena: 'Juanjosearias1@', rol: 'operador' },
  { nombre: 'Selena López',    correo: 'selenalopez@gmail.com',         contrasena: 'Selenalopez1@',   rol: 'gestor'   },
  { nombre: 'Pablo Amosa',     correo: 'pabloamosa@gmail.com',          contrasena: 'Pabloamosa1@',    rol: 'admin'    },
]

const NAVIERAS = [
  {
    nombre: 'Maersk', codigo: 'MAE',
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
    nombre: 'MSC', codigo: 'MSC',
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
    nombre: 'CMA CGM', codigo: 'CMA',
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
  {
    nombre: 'BAF', codigo: 'BAF',
    diasLibresDemurrage: 3, diasLibresDetention: 5,
    diasDemurrage: [
      { desdeDia: 1,  hastaDia: 5,    precioPorDia: 60  },
      { desdeDia: 6,  hastaDia: null, precioPorDia: 95  },
    ],
    diasDetention: [
      { desdeDia: 1,  hastaDia: 5,    precioPorDia: 50  },
      { desdeDia: 6,  hastaDia: null, precioPorDia: 80  },
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

async function resetContenedor(datos, correoCreador) {
  const existente = await Contenedor.findOne({ codigoBIC: datos.codigoBIC })
  if (existente) {
    await Ciclo.deleteMany({ contenedorId: existente._id })
    await Evento.deleteMany({ contenedorId: existente._id })
    await existente.deleteOne()
  }
  const nuevo = await Contenedor.create(datos)
  console.log(`  [ok]   ${datos.codigoBIC} — ${datos.estado} — creado por: ${correoCreador}`)
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
  const op1 = U['marilopez@gmail.com']
  const op2 = U['operador2@fluster.com']
  const op3 = U['operador3@fluster.com']
  // Las navieras se indexan por su código real de 3 letras (ISO 6346, prefijo de
  // propietario). Las variables conservan el nombre del prefijo BIC por claridad.
  const maeu = N['MAE'], mscu = N['MSC'], cmau = N['CMA'], bafu = N['BAF']
  const cl1 = C['Acme Logistics'], cl2 = C['Tech Global Freight'], cl3 = C['Iberia Cargo']

  // ── Contenedores ───────────────────────────
  console.log('\n=== Contenedores ===')

  // ── INACTIVO (2) ──────────────────────────
  const c1 = await upsertContenedor({
    codigoBIC: 'MAEU1234567', tipo: '20DC', estado: 'INACTIVO',
    navieraId: maeu._id, fechaInicioLibre: diasAtras(2), creadoPor: op1._id,
  }, 'marilopez@gmail.com')

  const c2 = await upsertContenedor({
    codigoBIC: 'MSCU7654321', tipo: '40HC', estado: 'INACTIVO',
    navieraId: mscu._id, fechaInicioLibre: diasAtras(1), creadoPor: op2._id,
  }, 'operador2@fluster.com')

  // ── SIN COSTE / freeTime (2) ──────────────
  // Maersk: 5 días libres demurrage. fechaInicioLibre 4 días → 0 facturables
  const c3 = await resetContenedor({
    codigoBIC: 'MAEU2345678', tipo: '40DC', estado: 'PUERTO',
    navieraId: maeu._id, fechaInicioLibre: diasAtras(4),
    fechaEntradaPuerto: diasAtras(3), creadoPor: op1._id,
  }, 'marilopez@gmail.com')

  // MSC: 5 días libres detention. Salida 3 días → 0 facturables
  const c4 = await resetContenedor({
    codigoBIC: 'MSCU3456789', tipo: '20DC', estado: 'CLIENTE',
    navieraId: mscu._id, fechaInicioLibre: diasAtras(18),
    fechaEntradaPuerto: diasAtras(15), fechaSalidaPuerto: diasAtras(3), creadoPor: op3._id,
  }, 'operador3@fluster.com')

  // ── PRIMER TRAMO (2) ──────────────────────
  // CMA CGM: 4 días libres demurrage. fechaInicioLibre 8 días → 4 facturables (tramo 1–4)
  const c5 = await resetContenedor({
    codigoBIC: 'CMAU1234567', tipo: '40HC', estado: 'PUERTO',
    navieraId: cmau._id, fechaInicioLibre: diasAtras(8),
    fechaEntradaPuerto: diasAtras(6), creadoPor: op2._id,
  }, 'operador2@fluster.com')

  // Maersk: 7 días libres detention. Salida 12 días → 5 facturables (tramo 1–7)
  const c6 = await resetContenedor({
    codigoBIC: 'MAEU4567890', tipo: '20DC', estado: 'CLIENTE',
    navieraId: maeu._id, fechaInicioLibre: diasAtras(25),
    fechaEntradaPuerto: diasAtras(20), fechaSalidaPuerto: diasAtras(12), creadoPor: op3._id,
  }, 'operador3@fluster.com')

  // ── SEGUNDO TRAMO (2) ─────────────────────
  // MSC: 7 días libres demurrage. fechaInicioLibre 25 días → 18 facturables (supera tramo 1–7)
  const c7 = await resetContenedor({
    codigoBIC: 'MSCU5678901', tipo: '40DC', estado: 'PUERTO',
    navieraId: mscu._id, fechaInicioLibre: diasAtras(25),
    fechaEntradaPuerto: diasAtras(22), creadoPor: op1._id,
  }, 'marilopez@gmail.com')

  // CMA CGM: 6 días libres detention. Salida 20 días → 14 facturables (supera tramo 1–6)
  const c8 = await resetContenedor({
    codigoBIC: 'CMAU9876543', tipo: '40HC', estado: 'CLIENTE',
    navieraId: cmau._id, fechaInicioLibre: diasAtras(40),
    fechaEntradaPuerto: diasAtras(35), fechaSalidaPuerto: diasAtras(20), creadoPor: op2._id,
  }, 'operador2@fluster.com')

  // ── Contenedores extra BAF (cubren todos los estados/tramos) ─────
  // BAF: diasLibresDemurrage=3, diasLibresDetention=5

  // INACTIVO — BAF (historial limpio para probar entrada a puerto desde cero)
  const c9 = await upsertContenedor({
    codigoBIC: 'BAFU1234567', tipo: '20DC', estado: 'INACTIVO',
    navieraId: bafu._id, fechaInicioLibre: diasAtras(3), creadoPor: op1._id,
  }, 'marilopez@gmail.com')

  // INACTIVO — Maersk extra (segundo para más variedad en la columna inactivos)
  const c10 = await upsertContenedor({
    codigoBIC: 'MAEU9999999', tipo: '40HC', estado: 'INACTIVO',
    navieraId: maeu._id, fechaInicioLibre: diasAtras(5), creadoPor: op2._id,
  }, 'operador2@fluster.com')

  // PUERTO sin-coste — BAF: 2 días, diasLibres=3 → 0 facturables
  const c11 = await resetContenedor({
    codigoBIC: 'BAFU2345678', tipo: '40DC', estado: 'PUERTO',
    navieraId: bafu._id, fechaInicioLibre: diasAtras(2),
    fechaEntradaPuerto: diasAtras(2), creadoPor: op2._id,
  }, 'operador2@fluster.com')

  // PUERTO primer-tramo — BAF: 7 días, 7-3=4 facturables (tramo 1–5 @60€/día)
  const c12 = await resetContenedor({
    codigoBIC: 'BAFU3456789', tipo: '20DC', estado: 'PUERTO',
    navieraId: bafu._id, fechaInicioLibre: diasAtras(7),
    fechaEntradaPuerto: diasAtras(6), creadoPor: op3._id,
  }, 'operador3@fluster.com')

  // CLIENTE sin-coste — BAF: salida hace 4 días, diasLibresDetention=5 → 0 facturables
  const c13 = await resetContenedor({
    codigoBIC: 'BAFU4567890', tipo: '40HC', estado: 'CLIENTE',
    navieraId: bafu._id, fechaInicioLibre: diasAtras(12),
    fechaEntradaPuerto: diasAtras(10), fechaSalidaPuerto: diasAtras(4), creadoPor: op1._id,
  }, 'marilopez@gmail.com')

  // CLIENTE segundo-tramo — BAF: salida hace 15 días, 15-5=10 facturables (tramo 6→∞ @80€/día)
  const c14 = await resetContenedor({
    codigoBIC: 'BAFU5678901', tipo: '20DC', estado: 'CLIENTE',
    navieraId: bafu._id, fechaInicioLibre: diasAtras(30),
    fechaEntradaPuerto: diasAtras(25), fechaSalidaPuerto: diasAtras(15), creadoPor: op2._id,
  }, 'operador2@fluster.com')

  // ── Ciclos ─────────────────────────────────
  console.log('\n=== Ciclos ===')

  // ── MAEU1234567 (INACTIVO) — 2 ciclos históricos
  await upsertCiclo(c1._id, cicloCerrado(c1._id, cl1._id, maeu, 120, 100, 85))
  await upsertCiclo(c1._id, cicloCerrado(c1._id, cl2._id, maeu,  70,  58, 45))

  // ── MSCU7654321 (INACTIVO) — 2 ciclos históricos
  await upsertCiclo(c2._id, cicloCerrado(c2._id, cl2._id, mscu, 110,  95, 80))
  await upsertCiclo(c2._id, cicloCerrado(c2._id, cl3._id, mscu,  60,  50, 38))

  // ── MAEU2345678 (PUERTO, sin-coste) — ciclo activo, 0 días facturables
  await Ciclo.create({
    contenedorId: c3._id, clienteId: cl1._id,
    demurrage: { diasLibres: maeu.diasLibresDemurrage, fechaInicio: diasAtras(4) },
  })

  // ── MSCU3456789 (CLIENTE, sin-coste) — demurrage cerrado + detention dentro de libres
  {
    const demDias = 12, demLibres = mscu.diasLibresDemurrage  // 12-7=5 facturables
    await Ciclo.create({
      contenedorId: c4._id, clienteId: cl2._id,
      demurrage: {
        diasLibres: demLibres, fechaInicio: diasAtras(15), fechaFin: diasAtras(3),
        diasTranscurridos: demDias,
        diasFacturables: Math.max(0, demDias - demLibres),
        costeTotal: calcularCoste(demDias, demLibres, mscu.diasDemurrage),
      },
      detention: { diasLibres: mscu.diasLibresDetention, fechaInicio: diasAtras(3) },
    })
  }

  // ── CMAU1234567 (PUERTO, primer-tramo) — 4 días facturables en tramo [1-4]
  await Ciclo.create({
    contenedorId: c5._id, clienteId: cl3._id,
    demurrage: { diasLibres: cmau.diasLibresDemurrage, fechaInicio: diasAtras(8) },
  })

  // ── MAEU4567890 (CLIENTE, primer-tramo) — detention 5 días facturables en tramo [1-7]
  {
    const demDias = 8, demLibres = maeu.diasLibresDemurrage   // 8-5=3 facturables
    await Ciclo.create({
      contenedorId: c6._id, clienteId: cl1._id,
      demurrage: {
        diasLibres: demLibres, fechaInicio: diasAtras(20), fechaFin: diasAtras(12),
        diasTranscurridos: demDias,
        diasFacturables: Math.max(0, demDias - demLibres),
        costeTotal: calcularCoste(demDias, demLibres, maeu.diasDemurrage),
      },
      detention: { diasLibres: maeu.diasLibresDetention, fechaInicio: diasAtras(12) },
    })
  }

  // ── MSCU5678901 (PUERTO, segundo-tramo) — 18 días facturables, supera tramo [1-7]
  await Ciclo.create({
    contenedorId: c7._id, clienteId: cl3._id,
    demurrage: { diasLibres: mscu.diasLibresDemurrage, fechaInicio: diasAtras(25) },
  })

  // ── CMAU9876543 (CLIENTE, segundo-tramo) — detention 14 días facturables, supera tramo [1-6]
  {
    const demDias = 15, demLibres = cmau.diasLibresDemurrage  // 15-4=11 facturables
    await Ciclo.create({
      contenedorId: c8._id, clienteId: cl2._id,
      demurrage: {
        diasLibres: demLibres, fechaInicio: diasAtras(35), fechaFin: diasAtras(20),
        diasTranscurridos: demDias,
        diasFacturables: Math.max(0, demDias - demLibres),
        costeTotal: calcularCoste(demDias, demLibres, cmau.diasDemurrage),
      },
      detention: { diasLibres: cmau.diasLibresDetention, fechaInicio: diasAtras(20) },
    })
  }

  // ── BAFU2345678 (PUERTO, sin-coste) — ciclo activo, 0 facturables
  await Ciclo.create({
    contenedorId: c11._id, clienteId: cl1._id,
    demurrage: { diasLibres: bafu.diasLibresDemurrage, fechaInicio: diasAtras(2) },
  })

  // ── BAFU3456789 (PUERTO, primer-tramo) — 4 facturables en tramo [1–5]
  await Ciclo.create({
    contenedorId: c12._id, clienteId: cl2._id,
    demurrage: { diasLibres: bafu.diasLibresDemurrage, fechaInicio: diasAtras(7) },
  })

  // ── BAFU4567890 (CLIENTE, sin-coste) — detention 4 días, diasLibres=5 → 0 facturables
  {
    const demDias = 6, demLibres = bafu.diasLibresDemurrage  // 6-3=3 facturables demurrage
    await Ciclo.create({
      contenedorId: c13._id, clienteId: cl3._id,
      demurrage: {
        diasLibres: demLibres, fechaInicio: diasAtras(10), fechaFin: diasAtras(4),
        diasTranscurridos: demDias,
        diasFacturables: Math.max(0, demDias - demLibres),
        costeTotal: calcularCoste(demDias, demLibres, bafu.diasDemurrage),
      },
      detention: { diasLibres: bafu.diasLibresDetention, fechaInicio: diasAtras(4) },
    })
  }

  // ── BAFU5678901 (CLIENTE, segundo-tramo) — detention 10 facturables en tramo [6→∞]
  {
    const demDias = 10, demLibres = bafu.diasLibresDemurrage  // 10-3=7 facturables demurrage
    await Ciclo.create({
      contenedorId: c14._id, clienteId: cl1._id,
      demurrage: {
        diasLibres: demLibres, fechaInicio: diasAtras(25), fechaFin: diasAtras(15),
        diasTranscurridos: demDias,
        diasFacturables: Math.max(0, demDias - demLibres),
        costeTotal: calcularCoste(demDias, demLibres, bafu.diasDemurrage),
      },
      detention: { diasLibres: bafu.diasLibresDetention, fechaInicio: diasAtras(15) },
    })
  }

  // ── Eventos ────────────────────────────────
  console.log('\n=== Eventos ===')

  await upsertEvento(c3._id,  'entrada_puerto', diasAtras(3),  op1._id)
  await upsertEvento(c4._id,  'entrada_puerto', diasAtras(15), op3._id)
  await upsertEvento(c4._id,  'salida_puerto',  diasAtras(3),  op3._id)
  await upsertEvento(c5._id,  'entrada_puerto', diasAtras(6),  op2._id)
  await upsertEvento(c6._id,  'entrada_puerto', diasAtras(20), op3._id)
  await upsertEvento(c6._id,  'salida_puerto',  diasAtras(12), op3._id)
  await upsertEvento(c7._id,  'entrada_puerto', diasAtras(22), op1._id)
  await upsertEvento(c8._id,  'entrada_puerto', diasAtras(35), op2._id)
  await upsertEvento(c8._id,  'salida_puerto',  diasAtras(20), op2._id)
  await upsertEvento(c11._id, 'entrada_puerto', diasAtras(2),  op2._id)
  await upsertEvento(c12._id, 'entrada_puerto', diasAtras(6),  op3._id)
  await upsertEvento(c13._id, 'entrada_puerto', diasAtras(10), op1._id)
  await upsertEvento(c13._id, 'salida_puerto',  diasAtras(4),  op1._id)
  await upsertEvento(c14._id, 'entrada_puerto', diasAtras(25), op2._id)
  await upsertEvento(c14._id, 'salida_puerto',  diasAtras(15), op2._id)

  // ─────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════')
  console.log('  Seed completado')
  console.log('══════════════════════════════════════════')
  console.log('\nCredenciales:')
  console.log('  admin@fluster.com      Admin1234   [admin]')
  console.log('  luis@gmail.com         Test1234    [gestor]')
  console.log('  gestor2@fluster.com    Test1234    [gestor]')
  console.log('  marilopez@gmail.com    Test1234    [operador]')
  console.log('  operador2@fluster.com  Test1234    [operador]')
  console.log('  operador3@fluster.com  Test1234    [operador]')
  console.log('\nSemáforo:')
  console.log('  INACTIVO      MAEU1234567 · MSCU7654321 · BAFU1234567 · MAEU9999999')
  console.log('  sin-coste     MAEU2345678 (PUERTO) · MSCU3456789 (CLIENTE)')
  console.log('                BAFU2345678 (PUERTO) · BAFU4567890 (CLIENTE)')
  console.log('  primer-tramo  CMAU1234567 (PUERTO) · MAEU4567890 (CLIENTE)')
  console.log('                BAFU3456789 (PUERTO)')
  console.log('  segundo-tramo MSCU5678901 (PUERTO) · CMAU9876543 (CLIENTE)')
  console.log('                BAFU5678901 (CLIENTE)')

  await mongoose.disconnect()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
