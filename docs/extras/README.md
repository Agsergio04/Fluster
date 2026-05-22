# Extras

Carpeta que documenta las mejoras añadidas a Fluster **más allá de los mínimos exigidos por las rúbricas**: seguridad del backend, buenas prácticas de DevOps y observabilidad. Sirven como evidencia adicional en la defensa.

## Contenido

- [Mejoras extra del proyecto](mejoras-extra.md) — qué es cada mejora, qué hace exactamente, dónde está configurada y cómo verificarla.

## Resumen de mejoras

| # | Mejora | Tipo | Configuración |
|---|---|---|---|
| 1 | Rate limiting | Seguridad | [`backend/src/app.js`](../../backend/src/app.js) |
| 2 | Helmet.js (cabeceras HTTP) | Seguridad | [`backend/src/app.js`](../../backend/src/app.js) |
| 3 | CORS restringido por entorno | Seguridad | [`backend/src/app.js`](../../backend/src/app.js) |
| 4 | Dependabot | DevOps | [`.github/dependabot.yml`](../../.github/dependabot.yml) |
| 5 | Trivy (escaneo en CI) | DevOps / Seguridad | [`.github/workflows/security.yml`](../../.github/workflows/security.yml) |
| 6 | Observabilidad básica | Operación | [`backend/src/app.js`](../../backend/src/app.js) |
