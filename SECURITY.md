# Política de Seguridad

La seguridad de Fluster se toma en serio. Este documento explica cómo reportar
vulnerabilidades, qué versiones reciben soporte y qué medidas de seguridad
están implementadas en el proyecto.

## Versiones con soporte

Al tratarse de un proyecto académico en desarrollo activo, solo la última
versión de la rama `main` recibe correcciones de seguridad.

| Versión | Soporte |
|---------|---------|
| `main` (última) | ✅ |
| Versiones anteriores | ❌ |

## Cómo reportar una vulnerabilidad

Si descubres una vulnerabilidad de seguridad, **no la publiques en un issue
público**. En su lugar, repórtala de forma privada por una de estas vías:

1. **GitHub Security Advisories** (recomendado): pestaña *Security → Report a
   vulnerability* del repositorio. Permite una divulgación coordinada y privada.
2. **Correo electrónico:** agsergio@iesrafaelalberti.es

Al reportar, incluye en la medida de lo posible:

- Descripción de la vulnerabilidad y su impacto.
- Pasos para reproducirla.
- Versión o commit afectado.
- Cualquier prueba de concepto o registro relevante.

### Qué esperar

- **Confirmación de recepción** en un plazo aproximado de 72 horas.
- **Evaluación y respuesta** sobre si se acepta la vulnerabilidad y los
  siguientes pasos.
- Se te mantendrá informado del progreso hasta la resolución. Agradecemos la
  divulgación responsable y, salvo que prefieras el anonimato, se reconocerá tu
  contribución.

## Medidas de seguridad implementadas

El proyecto incorpora las siguientes protecciones:

### Backend (API)

- **Autenticación con JWT** y autorización por roles (admin, gestor, operador)
  mediante middlewares (`authMiddleware`, `verificarRol`).
- **Contraseñas hasheadas** con bcrypt; nunca se almacenan ni se devuelven en
  texto plano.
- **Helmet** para cabeceras HTTP de seguridad (`X-Content-Type-Options`,
  `X-Frame-Options`, `Strict-Transport-Security`, etc.).
- **Rate limiting** (`express-rate-limit`): límite general de la API y límite
  más estricto en autenticación para mitigar fuerza bruta.
- **CORS** restringible al origen del frontend mediante la variable de entorno
  `CORS_ORIGIN`.
- **Gestión centralizada de errores** que oculta los detalles internos de los
  errores 500 en producción.
- **Secretos fuera del repositorio**: `.env` ignorado por Git; en producción se
  configuran como variables de entorno en la plataforma.

### CI/CD y dependencias

- **Dependabot**: revisión semanal de dependencias npm y GitHub Actions, con
  apertura automática de Pull Requests de actualización.
- **Trivy**: escaneo de vulnerabilidades en cada push y Pull Request a `main` y
  `dev`; bloquea ante vulnerabilidades `CRITICAL`/`HIGH` y publica los
  resultados en la pestaña *Security* del repositorio.
- **Integración continua**: los tests deben pasar antes de cualquier despliegue.

## Buenas prácticas para desplegar

- Define siempre un `JWT_SECRET` largo y aleatorio en producción.
- Configura `CORS_ORIGIN` con la URL real del frontend para no dejar la API
  abierta a cualquier origen.
- No subas nunca el fichero `.env` con credenciales reales al repositorio.
