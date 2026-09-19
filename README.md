# EcoRuta

EcoRuta conecta transportistas que ya tienen rutas planificadas con pequeñas empresas que necesitan mover carga. La idea es aprovechar capacidad que normalmente viajaría vacía y reducir viajes adicionales.

La plataforma tendrá una app móvil para transportistas y usuarios, un panel web para empresas y administración, y una API propia conectada a PostgreSQL.

## Estado actual

**v6** permite a los transportistas publicar y administrar rutas planificadas usando uno de sus vehículos. Cada ruta guarda origen, destino, coordenadas, horario estimado, distancia y estado operativo.

La capacidad sobrante del viaje se incorpora en v7. El matching logístico y EcoProof se desarrollan en versiones posteriores.

## Configuración

EcoRuta no incluye archivos `.env`. Las variables necesarias se definen manualmente en la terminal. Consulta `docs/local-development.md` para el entorno local.
