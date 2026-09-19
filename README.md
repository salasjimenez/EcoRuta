# EcoRuta

![EcoRuta](./assets/Logo_EcoRuta.png)

EcoRuta conecta transportistas que ya tienen una ruta planificada con pequeñas empresas que necesitan mover carga. La idea es aprovechar espacio disponible en viajes que de todos modos se realizarían y medir el CO2 evitado por cada operación compartida.

El proyecto tendrá dos piezas diferenciadoras: matching por capacidad logística real y EcoProof, una evidencia reproducible del ahorro de emisiones.

## Estado actual

**v4** diferencia las cuentas de transportistas, empresas y administradores. Cada transportista o empresa tiene un perfil propio y las operaciones de perfil están protegidas por JWT y rol.

Los administradores no pueden crearse desde el registro público.

## Puesta en marcha

Requiere Node.js 24 LTS, npm y Docker con Compose. El repositorio no incluye ningún archivo `.env`; si decides usar uno, debes crearlo manualmente.

Variables necesarias: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` y, opcionalmente, `JWT_EXPIRES_SECONDS`.

Los comandos de desarrollo y ejemplos de v4 están en `docs/local-development.md`.
