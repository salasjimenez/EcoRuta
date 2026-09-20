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

## v7 - Capacidad sobrante por ruta

Los endpoints de rutas requieren un JWT válido de una cuenta `transporter`.

Una ruta nueva incluye un objeto `capacity` con:

- `offeredWeightKg`: kg que el transportista ofrece para compartir.
- `offeredVolumeM3`: volumen que ofrece en m3.
- `acceptedCargoTypes`: tipos de carga admitidos en ese viaje.
- `maxPackageLengthCm`, `maxPackageWidthCm`, `maxPackageHeightCm`: límite opcional por bulto. Si se usa, deben indicarse las tres dimensiones.
- `notes`: restricción logística breve opcional.

La capacidad por peso o volumen debe ser mayor que cero y nunca puede superar los límites del vehículo. Los tipos de carga de la ruta deben ser compatibles con los definidos en el vehículo.

Endpoints específicos:

- `GET /api/routes/:id/capacity` consulta capacidad ofrecida, reservada y restante.
- `PATCH /api/routes/:id/capacity` modifica la capacidad mientras la ruta siga en estado `planned`.

`reservedWeightKg` y `reservedVolumeM3` no son editables por el transportista. En v7 permanecen en cero y quedan reservados para el sistema de solicitudes y matching de versiones posteriores.

Las rutas creadas en v6 se conservan. Después de la migración aparecerán con capacidad cero hasta que el transportista la configure mediante `PATCH /api/routes/:id/capacity`.
