# EcoRuta

EcoRuta conecta transportistas que ya tienen rutas planificadas con pequeñas empresas que necesitan mover carga. La plataforma aprovecha espacio que normalmente viajaría vacío para reducir viajes adicionales y, en versiones posteriores, medir el CO2 evitado.

## Estado actual

**v9** incorpora el primer motor de matching entre solicitudes abiertas y rutas planificadas. Compara origen, destino, ventanas horarias, capacidad disponible y tipo de carga, y devuelve únicamente coincidencias compatibles ordenadas por un puntaje básico.

El matching de v9 es de consulta: todavía no reserva espacio ni modifica las rutas. La optimización por desvío, dimensiones y restricciones logísticas más avanzadas se incorpora en v10.

## Configuración

EcoRuta no incluye archivos `.env`. Las variables necesarias se definen manualmente en la terminal. Consulta `docs/local-development.md` para ejecutar el entorno local.
