# EcoRuta

![EcoRuta](./assets/Logo_EcoRuta.png)

EcoRuta conecta transportistas que ya tienen una ruta planificada con pequeñas empresas que necesitan mover carga. La idea es aprovechar espacio que de otro modo viajaría vacío y medir el CO2 evitado por cada operación compartida.

La plataforma crecera alrededor de dos piezas propias: matching por capacidad logistica real y EcoProof, una evidencia reproducible del ahorro de emisiones.

## Estado actual

**v1** incluye la base de la API en NestJS y un endpoint de salud. PostgreSQL se incorpora en v2.

## Puesta en marcha

Requiere Node.js 24 LTS. Desde `backend/` ejecuta `npm install` y luego `npm run start:dev`. La API responde en `http://localhost:3000/api/health`.

No se incluye ningun archivo `.env`. Si quieres usar uno, debes crearlo manualmente. En v1 la única variable disponible es:

- `PORT`: puerto de la API. Valor por defecto: `3000`.

Los detalles de desarrollo local estan en `docs/local-development.md`.
