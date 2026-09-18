# EcoRuta

![EcoRuta](./assets/Logo_EcoRuta.png)

EcoRuta conecta transportistas que ya tienen una ruta planificada con pequeñas empresas que necesitan mover carga. Busca aprovechar espacio que de otro modo viajaría vacío y medir el CO2 evitado por cada operación compartida.

El proyecto se apoya en dos ideas propias: matching por capacidad logística real y EcoProof, una evidencia reproducible del ahorro de emisiones.

## Estado actual

**v2** incorpora PostgreSQL local con Docker, conexión desde NestJS, migraciones con TypeORM y verificación de conectividad de la base de datos.

## Puesta en marcha

Requiere Node.js 24 LTS, npm y Docker con Compose. El repositorio no incluye ningún archivo `.env`; si decides usar uno, debes crearlo manualmente.

Variables necesarias:

- `PORT`: puerto de la API. Opcional; por defecto `3000`.
- `DB_HOST`: host de PostgreSQL. Para desarrollo local: `localhost`.
- `DB_PORT`: puerto de PostgreSQL. Normalmente `5432`.
- `DB_NAME`: nombre de la base de datos.
- `DB_USER`: usuario de PostgreSQL.
- `DB_PASSWORD`: contraseña de PostgreSQL.

Los comandos de desarrollo están en `docs/local-development.md`.
