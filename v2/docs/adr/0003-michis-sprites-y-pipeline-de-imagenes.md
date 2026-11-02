# 0003. Los michis como identidad: sprites y pipeline de imágenes

**Estado:** Aceptada (2026-11-01)

## Contexto

La pastelería tiene tres gatos reales: Pivi (blanca, de cara manchada), Mandarino (naranja) y Zombie (carey). El rediseño los convierte en la identidad del sitio, no en un adorno. Hacía falta un conjunto de ilustraciones consistente que sirviera tanto para el logo como para animaciones por poses.

## Decisión

- **Personajes.** Pivi es la jefa de cocina y la oficial del trío, Mandarino el probador y Zombie la chef silenciosa. Los tres llevan gorro de chef y moño de color distinto.
- **Ilustraciones.** Estilo sticker con contorno brillante. Cada gato tiene 12 poses (`sit`, `blink`, `look-left`, `look-right`, `look-up`, `meow`, `crouch`, `pounce`, `swipe`, `peek`, `sleep`, `walk`) más 12 objetos (golosinas y ovillos). Las hojas originales quedan en `refs/`.
- **Pipeline en Python** (`v2/tools/`, solo para regenerar; el build normal no lo necesita):
  - `cutout.py` y `build_assets.py`: recortan cada pose con transparencia real. La banda exterior brillante del sticker se elimina con un relleno desde el borde (barrera por luminancia) y el resplandor se hornea por michi.
  - `build_extras.py`: traza el nombre a SVG con potrace, genera el ícono y favicon, la imagen para redes (`og.jpg`) y las fotos reales de los gatos.
  - `build_photos.py`: prepara las fotos de la galería.
  - `build_cat_poses.py`: normaliza 30 poses (las usadas en animaciones) a lienzos cuadrados de 808 x 808 px con el cuerpo anclado al centro y los pies alineados. Con lienzos idénticos, cambiar de pose no mueve ni cambia de tamaño al gato.
- **Carpetas.** `src/assets/michis` (poses recortadas), `src/assets/cats` (lienzos normalizados), `src/assets/brand` (trío, marca y nombre), `src/assets/gallery` (33 fotos curadas) y `refs/` (hojas, fotos reales y descartadas; no se despliegan).
- **Reglas de contenido para fotos.** No se muestran personas, adultas ni niñas o niños. Logos, volantes, marcas y nombres escritos en las tortas sí se permiten. Quedaron fuera `rv-1`, `T-6`, `boda-2` y cualquier foto con rostros.
- **Optimización.** Todas las imágenes pasan por `<Image>` de Astro: WebP, varios anchos con `srcset` y `sizes`, dimensiones declaradas y carga diferida fuera del primer pantallazo. Los archivos de `/_astro/` se sirven con caché inmutable de un año.

## Alternativas consideradas

- **Solo fotos reales de los gatos:** menos marca y sin poses; se usan únicamente en la sección de los michis.
- **Animación vectorial (Lottie o Rive):** exigiría redibujar a los gatos como vectores.
- **Un solo recorte del trío:** más liviano, pero sin posibilidad de animar cada gato.

## Consecuencias

- Regenerar assets requiere Python con Pillow, numpy, scipy y potracer.
- Agregar una pose nueva a una animación implica agregarla a `POSES` en `tools/build_cat_poses.py` y volver a correrlo.
- El repositorio pesa unos 46 MB por las hojas de referencia de `refs/`; se conservaron a propósito, usadas o no.
