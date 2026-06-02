# ─── Fase 1: compilar el proyecto con Vite ────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# La URL de la API se inyecta en build. Por defecto "/api" (relativo) para que
# las llamadas pasen por el proxy de nginx → backend, sin exponer el puerto 3000.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build


# ─── Fase 2: servir el build con nginx (imagen no-root) ───────
# nginx-unprivileged corre como el usuario "nginx" (UID 101), no como root,
# y escucha en el puerto 8080 (un usuario no-root no puede usar el 80).
FROM nginxinc/nginx-unprivileged:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
