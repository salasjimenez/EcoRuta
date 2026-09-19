# EcoRuta

EcoRuta conecta transportistas que ya tienen rutas planificadas con pequeñas empresas que necesitan mover carga. La idea es aprovechar capacidad que normalmente viajaría vacía y reducir viajes adicionales.

La plataforma tendrá una app móvil para transportistas y usuarios, un panel web para empresas y administración, y una API propia conectada a PostgreSQL.

## Estado actual

**v5** incorpora vehículos para cuentas transportistas. Cada vehículo registra tipo, placa, capacidad máxima por peso y volumen, disponibilidad y categorías de carga admitidas.

El proyecto mantiene dos componentes diferenciadores para las siguientes versiones: matching basado en capacidad logística real y EcoProof para registrar el CO2 evitado por operaciones compartidas.

## Configuración

EcoRuta no incluye archivos `.env`. Las variables necesarias se definen manualmente en la terminal. Consulta `docs/local-development.md` para el entorno local.
