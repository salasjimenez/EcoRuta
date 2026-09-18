# Desarrollo local

## Requisitos

- Node.js 24 LTS
- npm
- Docker con Docker Compose

## 1. Variables

EcoRuta no genera ni distribuye archivos `.env`. Para una sesión local puedes exportar las variables directamente en la terminal.

Git Bash, Linux o macOS:

```bash
export PORT=3000
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=ecoruta
export DB_USER=ecoruta
export DB_PASSWORD=ecoruta_local
```

PowerShell:

```powershell
$env:PORT="3000"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="ecoruta"
$env:DB_USER="ecoruta"
$env:DB_PASSWORD="ecoruta_local"
```

Los valores anteriores son solo para desarrollo local. Si prefieres un `.env`, créalo tú mismo y no lo subas al repositorio.

## 2. PostgreSQL

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Comprueba el contenedor:

```bash
docker compose ps
```

## 3. Backend

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

La migración inicial habilita `pgcrypto`, que se usará más adelante para UUIDs generados desde PostgreSQL.

## 4. Comprobaciones

API:

```bash
curl http://localhost:3000/api/health
```

Base de datos:

```bash
curl http://localhost:3000/api/health/database
```

La segunda ruta ejecuta una consulta real contra PostgreSQL. Si responde con `"connected": true`, NestJS está usando correctamente la base de datos.

## Migraciones

Ver migraciones pendientes o aplicadas:

```bash
npm run migration:show
```

Aplicar migraciones:

```bash
npm run migration:run
```

Revertir la última migración:

```bash
npm run migration:revert
```

No uses `synchronize: true`. El esquema debe cambiar mediante migraciones para que el historial sea reproducible.

## Detener PostgreSQL

```bash
docker compose down
```

Para eliminar también los datos locales:

```bash
docker compose down -v
```
