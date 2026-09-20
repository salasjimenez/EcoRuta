# EcoRuta

EcoRuta conecta transportistas que ya tienen rutas planificadas con pequeñas empresas que necesitan mover carga. La plataforma aprovecha espacio que normalmente viajaría vacío para reducir viajes adicionales y, en versiones posteriores, medir el CO2 evitado.

## Estado actual

**v8** permite que las empresas publiquen solicitudes de transporte con origen, destino, tipo de carga, peso, volumen, dimensiones y ventanas horarias de recojo y entrega.

Cada empresa administra únicamente sus propias solicitudes. Las solicitudes quedan en estado `open` hasta ser canceladas; el matching automático con rutas disponibles se incorpora en v9.

## Configuración

EcoRuta no incluye archivos `.env`. Las variables necesarias se definen manualmente en la terminal. Consulta `docs/local-development.md` para ejecutar el entorno local.
