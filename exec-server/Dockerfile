# ── Build a lean image with JDK 21 + Python 3 + Node 20 ──────────────────────
FROM eclipse-temurin:21-jdk-jammy

# Install Python 3 and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user for safer execution
RUN useradd -m -u 1001 runner

WORKDIR /app
COPY package.json server.js ./
RUN chown -R runner:runner /app

USER runner

EXPOSE 3001

ENV NODE_ENV=production \
    PORT=3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
