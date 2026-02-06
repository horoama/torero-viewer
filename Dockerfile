# Stage 1: Build Frontend
FROM node:22-alpine AS builder
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Backend
FROM node:22-alpine
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
# Copy built frontend assets
COPY --from=builder /app/client/dist /app/client/dist

EXPOSE 3001
CMD ["node", "index.js"]
