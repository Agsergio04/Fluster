# ─── Imagen base más ligera disponible para Node ──────────────
FROM node:22-alpine

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# Ejecutar como usuario no-root (incluido en la imagen oficial de Node)
USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
