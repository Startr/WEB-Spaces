# Stage 1: Build
FROM oven/bun:latest AS builder
WORKDIR /project

# Install Python for salt_rooms.py build hook
RUN apt-get update && apt-get install -y python3 --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Stage 2: Serve
FROM oven/bun:latest
WORKDIR /project
COPY --from=builder /project/dist ./dist
COPY server.js ./
EXPOSE 8080
CMD ["bun", "server.js"]
