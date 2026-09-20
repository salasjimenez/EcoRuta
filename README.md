# EcoRuta

EcoRuta conecta transportistas que ya tienen rutas planificadas con pequeñas empresas que necesitan mover carga. La plataforma aprovecha espacio que normalmente viajaría vacío para reducir viajes adicionales y, en versiones posteriores, medir el CO2 evitado.

## Estado actual

**v7** permite que cada ruta publique capacidad sobrante real por peso y volumen, indique los tipos de carga aceptados y, si hace falta, limite las dimensiones máximas de cada bulto.

La capacidad ofrecida nunca puede superar la capacidad del vehículo. EcoRuta guarda por separado la capacidad ofrecida y la reservada, dejando preparado el modelo para el matching y las reservas de versiones posteriores.

## Configuración

EcoRuta no incluye archivos `.env`. Las variables necesarias se definen manualmente en la terminal. Consulta `docs/local-development.md` para ejecutar el entorno local.
