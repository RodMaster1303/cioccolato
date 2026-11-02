# 0010. Todas las poses de los michis tienen un lugar visible

**Estado:** Aceptada (2026-11-02)

## Contexto

El dueño pidió que no se desperdicie ninguna imagen de los gatos: todas las caritas y todas las poses de Pivi, Mandarino y Zombie deben verse en el sitio. Una búsqueda en el código el 2026-11-02 mostró qué faltaba:

- Mandarino: `crouch`, `pounce`, `peek` y `walk` sin uso.
- Zombie: `swipe` y `walk` sin uso.
- Los ovillos naranja y celeste (`obj-yarn-orange`, `obj-yarn-cyan`) sin uso.
- Las capas del trío (`trio-gatos` y `trio-postres`) sin uso desde que el hero se armó con poses sueltas.
- La pose `peek` de Pivi solo se veía en el menú del teléfono, así que en escritorio no aparecía en ningún lado.

## Decisión

Cada imagen pendiente recibe un lugar con sentido en la escena de ese michi:

| Imagen | Dónde se ve |
|---|---|
| `peek` de Mandarino | Asomado sobre la tarjeta de WhatsApp de Contacto |
| `peek` de Pivi | Asomada sobre las preguntas frecuentes de Contacto (además del menú del teléfono) |
| `peek` de Zombie | Sobre el formulario de cotización (ya estaba) |
| `walk` de los tres | Desfilan por la franja de palabras de la portada, mirando en el sentido del movimiento, con un trote |
| `crouch`, `pounce` y `swipe` | En el hero, al tocar una golosina el gato más cercano se agazapa, salta hacia ella y la manotea; la pose se espeja si la golosina queda a su izquierda |
| `crouch` y `pounce` de Mandarino | En la escena del macaron de la Carta: se agazapa, salta y tira el macaron |
| `swipe` de Zombie | Saluda con la patita cuando se despierta en el pie de página |
| Ovillos naranja y celeste | Junto a Mandarino y Zombie dormidos en el pie, y el rosa junto a Pivi; ruedan cuando se despierta al michi |
| `trio-gatos` y `trio-postres` | Retrato del trío, en dos capas que flotan, en el encabezado de Nosotros |

Componentes nuevos: `PeekCat` (michi asomado sobre un borde) y `TrioPortrait`. La burbuja de maullido pasó a `Cat` (`.cat-bubble`) para que la usen el hero y la escena del macaron.

**Verificación.** `npm run check:sprites` lee el HTML generado y falla si alguna de las 36 poses, los 12 objetos, las capas del trío o las 3 fotos reales no aparece en ninguna página. Se mira el HTML y no la carpeta `dist` porque Astro copia a `dist` todas las imágenes importadas aunque no se usen. Resultado actual: 53 de 53.

## Alternativas consideradas

- **Rehacer la escena de scroll con los tres gatos y tres ovillos.** Descartada por ahora: es una reescritura grande de una escena que ya funciona y suma peso en celular.
- **Borrar las imágenes sin uso.** Descartada: el dueño pidió usarlas.
- **Galería con todas las poses juntas.** Descartada: no aporta a la marca.

## Consecuencias

- Este ADR ajusta un detalle del ADR 0005: el grupo `late` del hero, que solo tenía la pose de sueño y se activaba a los 9 segundos, ahora incluye `crouch`, `pounce` y `swipe` y se activa a los 3 segundos.
- El hero descarga 9 imágenes más (grupo `late`) a los 3 segundos de cargar la página, mientras el preloader sigue en pantalla, para que el combo esté listo cuando aparece el hero sin competir con la carga inicial. Se descargan para todos los visitantes, también con ahorro de datos. Si alguien toca una golosina antes de que lleguen, rebota sin el combo de salto.
- La franja de palabras pasó de unos 86 px a unos 124 px de alto en escritorio por los gatos que caminan.
- La zona que responde al toque de cada gato del hero se redujo a su cuerpo (`hero-hit`), para que las golosinas que quedan detrás de su lienzo transparente sigan siendo tocables.
- Un michi nuevo o una pose nueva debe sumarse a la lista de `tools/check-sprites.mjs` y tener su lugar en una escena.
- Mediciones después del cambio: Lighthouse móvil 90 en dos corridas con la máquina tranquila y escritorio 100 en portada, Contacto y Nosotros.
