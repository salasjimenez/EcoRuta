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

## v5 - Vehículos

Los endpoints de vehículos requieren un JWT válido de una cuenta `transporter`.

- `POST /api/vehicles` crea un vehículo.
- `GET /api/vehicles` lista solo los vehículos del transportista autenticado.
- `GET /api/vehicles/:id` obtiene un vehículo propio.
- `PATCH /api/vehicles/:id` actualiza un vehículo propio.
- `DELETE /api/vehicles/:id` elimina un vehículo propio.

Tipos de vehículo disponibles:

`cargo_van`, `pickup`, `light_truck`, `medium_truck`, `heavy_truck`, `refrigerated_truck`.

Tipos de carga disponibles:

`general`, `food`, `perishable`, `refrigerated`, `fragile`, `textile`, `electronics`, `construction_materials`, `other`.
