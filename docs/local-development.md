# Desarrollo local

## Requisitos

- Node.js 24 LTS
- npm
- Docker con Docker Compose

## 1. Variables

EcoRuta no genera ni distribuye archivos `.env`. Exporta las variables en la terminal antes de levantar Docker o el backend.

Git Bash, Linux o macOS:

```bash
export PORT=3000
export DB_HOST=127.0.0.1
export DB_PORT=55432
export DB_NAME=ecoruta
export DB_USER=ecoruta
export DB_PASSWORD=ecoruta_local
export JWT_SECRET='cambia-esta-clave-local-por-una-de-32-caracteres-o-mas'
export JWT_EXPIRES_SECONDS=7200
```

PowerShell:

```powershell
$env:PORT="3000"
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="55432"
$env:DB_NAME="ecoruta"
$env:DB_USER="ecoruta"
$env:DB_PASSWORD="ecoruta_local"
$env:JWT_SECRET="cambia-esta-clave-local-por-una-de-32-caracteres-o-mas"
$env:JWT_EXPIRES_SECONDS="7200"
```

Los valores son únicamente para desarrollo local. Si prefieres trabajar con un `.env`, debes crearlo tú mismo; `.gitignore` ya evita que se suba al repositorio.

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

La migración de v3 crea la tabla `users`. `synchronize` permanece desactivado.

## 4. Salud de la API

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/database
```

## 5. Registrar un usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Juan Roman",
    "email": "juan@example.com",
    "password": "EcoRuta2026!"
  }'
```

La respuesta incluye `accessToken` y los datos públicos del usuario. El hash de la contraseña nunca se devuelve.

## 6. Iniciar sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "EcoRuta2026!"
  }'
```

## 7. Consultar la sesión

Guarda el JWT recibido en una variable temporal:

```bash
export TOKEN='PEGA_AQUI_EL_ACCESS_TOKEN'
```

Consulta la ruta protegida:

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Migraciones

```bash
npm run migration:show
npm run migration:run
npm run migration:revert
```

No uses `synchronize: true`. El esquema debe cambiar mediante migraciones.

## Detener PostgreSQL

```bash
docker compose down
```

Para eliminar también los datos locales:

```bash
docker compose down -v
```
