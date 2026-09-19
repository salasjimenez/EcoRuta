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

Los valores son únicamente para desarrollo local. `.gitignore` contiene la referencia a `.env`, pero el proyecto no crea ese archivo.

## 2. PostgreSQL

Desde la raíz del proyecto:

```bash
docker compose up -d
docker compose ps
```

Si vienes de v3, no uses `docker compose down -v`; la migración de v4 conserva tus usuarios existentes.

## 3. Backend y migración de v4

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

La nueva migración agrega:

- rol en `users`: `transporter`, `company` o `admin`;
- tabla `transporter_profiles`;
- tabla `company_profiles`;
- tabla `admin_profiles`.

Los usuarios creados en v3 se conservan y pasan a `transporter`, con un perfil de transportista inicial vacío.

## 4. Registrar un transportista

`accountType` puede omitirse y, por compatibilidad con v3, se asumirá `transporter`.

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Carlos Rojas",
    "email": "carlos.transportista@example.com",
    "password": "EcoRuta2026!",
    "accountType": "transporter"
  }'
```

## 5. Registrar una empresa

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Maria Torres",
    "email": "operaciones@bodegalima.example",
    "password": "EcoRuta2026!",
    "accountType": "company"
  }'
```

El registro público solo acepta `transporter` y `company`. Enviar `admin` devuelve `400`.

## 6. Consultar el perfil propio

Inicia sesión y guarda el JWT:

```bash
export TOKEN='PEGA_AQUI_EL_ACCESS_TOKEN'
```

```bash
curl http://localhost:3000/api/profiles/me \
  -H "Authorization: Bearer $TOKEN"
```

La respuesta incluye los datos comunes del usuario, su `role` y el perfil correspondiente.

## 7. Actualizar perfil de transportista

```bash
curl -X PATCH http://localhost:3000/api/profiles/me/transporter \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+51 999 111 222",
    "baseCity": "Lima",
    "bio": "Transporte de carga seca en rutas interprovinciales."
  }'
```

Una cuenta `company` o `admin` recibe `403` al intentar usar este endpoint.

## 8. Actualizar perfil de empresa

Con un token de una cuenta `company`:

```bash
curl -X PATCH http://localhost:3000/api/profiles/me/company \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Bodega Lima SAC",
    "taxId": "20123456789",
    "phoneNumber": "+51 999 333 444",
    "baseCity": "Lima"
  }'
```

## 9. Administradores

No existe registro público de administradores. Para desarrollo u operación interna, primero crea un usuario normal y luego ejecuta desde `backend`:

```bash
npm run user:promote-admin -- correo@ejemplo.com
```

El comando cambia el rol dentro de una transacción y elimina cualquier perfil de transportista o empresa asociado. En el siguiente request autenticado, el guard consulta el rol actual de PostgreSQL, por lo que no es necesario emitir un JWT nuevo solo por el cambio de rol.

## 10. Endpoints disponibles en v4

```text
GET    /api/health
GET    /api/health/database
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/profiles/me
PATCH  /api/profiles/me/transporter
PATCH  /api/profiles/me/company
PATCH  /api/profiles/me/admin
```

## Migraciones

```bash
npm run migration:show
npm run migration:run
npm run migration:revert
```

No uses `synchronize: true`. El esquema cambia únicamente mediante migraciones.

## 11. Actualizar perfil de administrador

Después de promover un usuario a `admin`, inicia sesión con esa cuenta y usa su token:

```bash
curl -X PATCH http://localhost:3000/api/profiles/me/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Operaciones",
    "jobTitle": "Administrador de plataforma"
  }'
```
