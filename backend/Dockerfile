# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Create logs directory (volume-mounted in compose)
RUN mkdir -p logs

# ── Runtime ───────────────────────────────────────────────────────────────────
EXPOSE 5000

# Use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "server.js"]
