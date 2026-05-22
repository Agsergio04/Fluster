# RA6.a — Análisis de usabilidad

> **RA vinculado:** RA6 — CE 6.a  
> **Módulo:** Diseño de Interfaces Web  
> **Nota:** 5.5/10

---

## Índice

1. [Heurísticas de Nielsen aplicadas en Fluster](#1-heurísticas-de-nielsen-aplicadas-en-fluster)
2. [Patrones de usabilidad identificados y aplicados](#2-patrones-de-usabilidad-identificados-y-aplicados)
3. [Leyes de UX aplicadas](#3-leyes-de-ux-aplicadas)
4. [Análisis de flujos críticos](#4-análisis-de-flujos-críticos)

---

## 1. Heurísticas de Nielsen aplicadas en Fluster

Las 10 heurísticas de Nielsen se usaron como criterio de evaluación durante el proceso de diseño de Fluster. Para cada heurística se identifica cómo el proyecto la aplica.

| # | Heurística | Aplicación en Fluster |
|---|---|---|
| 1 | **Visibilidad del estado** | El semáforo muestra el estado de riesgo de cada contenedor con color en tiempo real. El `Spinner` (`role="status"`) indica cuándo hay una operación en curso. Los mensajes de éxito/error aparecen como toast inmediatamente tras cada acción. |
| 2 | **Coincidencia con el mundo real** | Los cuatro niveles de riesgo usan los colores del semáforo real (verde/amarillo/rojo/gris). El vocabulario es del sector: "BIC", "naviera", "D&D", "libre estadía" — no se usan tecnicismos de software. |
| 3 | **Control y libertad** | Las acciones destructivas (eliminar contenedor, eliminar usuario) requieren confirmación en un modal antes de ejecutarse. Los formularios permiten cancelar sin guardar. |
| 4 | **Consistencia y estándares** | El sistema de diseño garantiza que todos los botones de la misma función tienen el mismo aspecto. El menú de navegación siempre está en el mismo lugar. Las tarjetas de contenedor tienen siempre la misma estructura. |
| 5 | **Prevención de errores** | La validación inline (`onBlur`) avisa antes de enviar el formulario. El OCR previene los errores de transcripción del código BIC. Los campos de contraseña tienen toggle de visibilidad para evitar errores al escribir. |
| 6 | **Reconocimiento mejor que recuerdo** | El menú de navegación siempre es visible — el usuario no necesita recordar cómo llegar a cada sección. El color de cada columna del semáforo identifica el nivel de riesgo sin leer la etiqueta. |
| 7 | **Flexibilidad y eficiencia** | Los operadores registran un contenedor en pocos pasos gracias al OCR. Los gestores filtran y exportan informes con pocos clics. El buscador filtra en tiempo real sin recargar la página. |
| 8 | **Diseño estético y minimalista** | Las tarjetas muestran solo los datos más relevantes. La información secundaria (historial completo, informe detallado) está en páginas específicas. No hay elementos decorativos sin propósito funcional. |
| 9 | **Ayuda a reconocer y recuperarse de errores** | Los mensajes de error son específicos por campo con `role="alert"`. El OCR informa con un mensaje claro si no puede leer el código BIC. Los errores de red muestran un mensaje accionable, no un código técnico. |
| 10 | **Ayuda y documentación** | El manual de usuario está disponible en `docs/09-manual-usuario.md`. La interfaz está diseñada para ser autoexplicativa sin necesitar consultar el manual para las tareas principales. |

---

## 2. Patrones de usabilidad identificados y aplicados

Durante el análisis previo al diseño se identificaron patrones de usabilidad de herramientas profesionales y aplicaciones web de referencia.

### Patrones adoptados

**Semáforo de color como comunicador de estado**
Usado en herramientas de gestión de proyectos, sistemas de monitorización y paneles de control. El color transmite la urgencia antes que el texto: el usuario puede escanear 80 contenedores y saber cuáles requieren atención sin leer ningún dato.

**Confirmación antes de eliminar**
Patrón universal en aplicaciones que gestionan datos con consecuencias reales. En Fluster, eliminar un contenedor o un usuario es una acción irreversible, por lo que el modal de confirmación es obligatorio.

**Validación inline por campo**
Adoptado de los formularios modernos (Gmail, formularios de pago). El error aparece en el campo concreto que lo genera, no en un mensaje genérico al enviar. Esto reduce el tiempo de corrección y la frustración del usuario.

**Búsqueda en tiempo real**
El buscador de contenedores filtra mientras el usuario escribe, sin necesidad de presionar Enter ni recargar. Reduce el tiempo de localización de un contenedor concreto entre decenas.

**Toast de confirmación**
Tras guardar o eliminar correctamente, aparece un mensaje de confirmación no intrusivo que desaparece solo. El usuario no tiene que cerrar ningún diálogo — puede seguir trabajando inmediatamente.

### Patrones evitados

**Inicio de sesión con múltiples pasos**
Algunas aplicaciones dividen el login en dos pantallas (primero correo, luego contraseña). En Fluster es un único formulario porque el contexto no requiere detectar si el usuario tiene cuenta SSO o no.

**Sobresaturación de funcionalidad en la pantalla principal**
La pantalla de inicio de Fluster muestra solo la información relevante al rol del usuario. Un Operador no ve las tarifas ni el panel de control; un Gestor no ve opciones de administración de usuarios.

**Notificaciones invasivas**
Los mensajes de éxito son toasts no bloqueantes. No se usan `alert()` del navegador ni modales para acciones que funcionaron correctamente.

---

## 3. Leyes de UX aplicadas

### Ley de Fitts — tamaño de objetivos interactivos

Los elementos que el usuario activa con más frecuencia tienen mayor área de clic:
- El botón de envío de formularios ocupa todo el ancho del formulario en móvil.
- Los botones de acción principales son más grandes que los secundarios (cancelar, editar).
- Las tarjetas del almacén tienen botones de acción en la zona inferior, accesible con el pulgar en móvil.

### Ley de la Región Común — agrupación visual

Los elementos relacionados se agrupan visualmente dentro de la misma tarjeta o sección:
- Los datos de un contenedor (código BIC, naviera, estado, coste) están siempre en la misma tarjeta.
- Las acciones sobre un contenedor (editar, eliminar) están agrupadas en la zona de acciones de la tarjeta.
- Los campos de un formulario están agrupados con su etiqueta y su mensaje de error.

### Ley de la Proximidad — jerarquía de información

La distancia entre elementos comunica su relación:
- Las etiquetas están más cerca del campo al que pertenecen que del campo anterior.
- Los botones de confirmación y cancelación están juntos al final del formulario o modal.
- El título de cada sección está más cerca de su contenido que de la sección anterior.

### Efecto Zeigarnik — indicadores de progreso

El cerebro recuerda mejor las tareas incompletas. En Fluster:
- El `Spinner` durante la carga mantiene al usuario consciente de que hay una tarea en curso.
- El estado "guardando" en los botones (`btn-accion-tarifa--guardando`) comunica que la acción está en proceso.

---

## 4. Análisis de flujos críticos

Se analizaron los tres flujos más importantes de la aplicación para identificar puntos de fricción y optimizarlos.

### Flujo 1 — Registrar un contenedor nuevo

```
Inicio → Almacén → "Añadir contenedor"
       → Hacer foto del contenedor (OCR)
       → Sistema lee el código BIC automáticamente
       → Rellenar datos adicionales (naviera, cliente, fechas)
       → Confirmar
```

**Fricción identificada:** sin OCR, el usuario tendría que escribir manualmente el código BIC (11 caracteres alfanuméricos con formato específico). Los errores de transcripción eran habituales en el flujo anterior.  
**Solución:** OCR automático con Tesseract.js — la foto hace el trabajo.

### Flujo 2 — Ver contenedores en riesgo

```
Inicio → Semáforo
       → Columna "Segundo tramo" (rojo) — contenedores más urgentes
       → Seleccionar contenedor → Ver historial y coste acumulado
```

**Fricción identificada:** el usuario necesitaba abrir cada contenedor para saber si estaba en D&D. Con muchos contenedores activos, esto requería revisar uno a uno.  
**Solución:** vista semáforo con columnas por nivel de riesgo — la distribución visual hace la clasificación automáticamente.

### Flujo 3 — Generar informe de coste para un cliente

```
Inicio → Almacén → Sección "Informe"
       → Seleccionar rango de fechas
       → Seleccionar contenedores a incluir
       → "Generar PDF" → Descarga automática
```

**Fricción identificada:** el usuario necesitaba construir el informe manualmente en Excel con datos de varios sistemas.  
**Solución:** el panel de informe genera el PDF directamente desde los datos del sistema, con filtros de fecha y selección de contenedores.
