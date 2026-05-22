# Guía de contribución

¡Gracias por tu interés en contribuir a Fluster! Esta guía explica cómo preparar
el entorno, el flujo de trabajo y las convenciones del proyecto.

Al participar, te comprometes a respetar nuestro [Código de Conducta](./CODE_OF_CONDUCT.md).

## Requisitos previos

- **Node.js 22** o superior.
- **MongoDB** (local) o una cadena de conexión a MongoDB Atlas.
- Opcional: **Docker** y **Docker Compose** para levantar todo el stack.

## Preparar el entorno

```bash
# Clonar el repositorio
git clone https://github.com/Agsergio04/Fluster.git
cd Fluster

# Backend
cd backend
npm ci
cp .env.example .env   # rellena MONGO_URI, JWT_SECRET (y CORS_ORIGIN si aplica)
npm run dev

# Frontend (en otra terminal)
cd frontend
npm ci
cp .env.example .env   # rellena VITE_API_URL
npm run dev
```

Alternativa con Docker (levanta frontend + backend + MongoDB):

```bash
cp .env.example .env
docker compose up -d --build
```

Consulta la [guía de instalación](./docs/03-instalacion.md) para más detalle.

## Flujo de trabajo con Git

- `main` es la rama **estable**: solo recibe código que pasa CI.
- `dev` es la rama de **desarrollo**.
- Crea una rama de feature a partir de `dev` para cada cambio:

```bash
git switch dev
git switch -c feat/nombre-descriptivo
```

- Abre el Pull Request hacia `dev` (o hacia `main` para releases). La CI
  (tests + build) debe pasar antes de fusionar.

## Convención de commits

El proyecto usa [Conventional Commits](https://www.conventionalcommits.org/es/).
El mensaje empieza por un tipo, opcionalmente con ámbito entre paréntesis:

```
<tipo>(<ámbito opcional>): descripción breve en imperativo
```

Tipos habituales:

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un error |
| `docs` | Cambios solo en documentación |
| `style` | Formato/estilos sin cambio de lógica |
| `refactor` | Reestructuración sin cambiar comportamiento |
| `perf` | Mejora de rendimiento |
| `test` | Añadir o corregir pruebas |
| `chore` | Tareas de mantenimiento, CI, dependencias |

Ejemplos: `feat(backend): añadir rate limiting`, `fix: corregir cálculo de detention`.

## Pruebas

Antes de abrir un PR, asegúrate de que todo pasa:

```bash
# Backend — tests unitarios y de integración (Jest)
cd backend && npm test

# Frontend — tests unitarios (Vitest)
cd frontend && npm test

# Frontend — tests end-to-end (Playwright)
cd frontend && npm run test:e2e
```

Si añades funcionalidad, acompáñala de pruebas. Si corriges un error, añade un
test que lo cubra cuando sea posible.

## Estilo de código

- **Backend:** arquitectura MVC (rutas → controladores → servicios → modelos).
  La lógica de negocio vive en los servicios.
- **Frontend:** Atomic Design (átomos, moléculas, organismos) y estilos con
  ITCSS + metodología BEM.
- Mantén el código comentado solo donde el *por qué* no sea obvio.

## Reportar errores o vulnerabilidades

- **Errores funcionales:** abre un *issue* describiendo los pasos para
  reproducirlo, el comportamiento esperado y el observado.
- **Vulnerabilidades de seguridad:** NO abras un issue público; sigue la
  [política de seguridad](./SECURITY.md).

## Pull Requests

1. Asegúrate de que la CI pasa (tests + build).
2. Describe **qué** cambia y **por qué**.
3. Vincula el issue relacionado si existe.
4. Mantén el PR enfocado en un solo objetivo.
