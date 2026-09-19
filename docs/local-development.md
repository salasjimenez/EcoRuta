# Desarrollo local

## Requisitos

- Node.js 24 LTS
- npm
- Docker Desktop con Docker Compose

EcoRuta no genera archivos `.env`. Define las variables en la terminal donde ejecutarás Docker, migraciones y la API.

```bash
export PORT=3000
export DB_HOST=127.0.0.1
export DB_PORT=55432
export DB_NAME=ecoruta
export DB_USER=ecoruta
export DB_PASSWORD=ecoruta_local
export JWT_SECRET='ecoruta-local-jwt-secret-2026-cambiar-en-produccion'
export JWT_EXPIRES_SECONDS=7200
```

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Desde `backend`:

```bash
npm install
npm run migration:run
npm run start:dev
```

La API queda disponible en `http://localhost:3000/api`.

## v6 - Rutas planificadas

Los endpoints de rutas requieren un JWT válido de una cuenta `transporter`.

- `POST /api/routes` publica una ruta usando un vehículo propio disponible.
- `GET /api/routes` lista las rutas del transportista autenticado.
- `GET /api/routes/:id` obtiene una ruta propia.
- `PATCH /api/routes/:id` actualiza una ruta propia.
- `DELETE /api/routes/:id` elimina una ruta planificada o cancelada.

Estados disponibles:

`planned`, `in_progress`, `completed`, `cancelled`.

Transiciones permitidas:

- `planned` -> `in_progress` o `cancelled`
- `in_progress` -> `completed` o `cancelled`
- `completed` y `cancelled` son estados finales

Una ruta necesita origen y destino con coordenadas, una salida, una llegada estimada posterior y una distancia estimada mayor a cero. Los datos del recorrido solo pueden modificarse mientras la ruta siga en estado `planned`.

La v6 todavía no descuenta ni publica capacidad sobrante del vehículo; esa funcionalidad pertenece a v7.
