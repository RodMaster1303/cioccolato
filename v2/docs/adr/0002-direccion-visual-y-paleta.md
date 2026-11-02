# 0002. Dirección visual y paleta

**Estado:** Aceptada (2026-11-01)

## Contexto

El logo nuevo usa colores neón sobre fondo oscuro. Se evaluaron varias paletas y el dueño eligió la "C": oscura donde hay impacto (preloader y hero), clara donde se lee (secciones) y cálida en el cierre (pie).

## Decisión

- **Hero y preloader:** fondo cacao `#140a0f`, con estrellas sutiles y halos rosados.
- **Secciones de contenido:** crema `#fff7ec` y `#fbebd6`, texto chocolate `#2a1710`.
- **Pie de página:** chocolate oscuro.
- **Neón solo como acento:** rosa brillo `#f15591`, cian `#26e9eb`, lima `#8feb58`, naranja `#ee7c3e`, ámbar `#f4c864`. Para texto rosa sobre crema se usa `#c21e63`, que cumple contraste.
- **Tipografía:** Fraunces para títulos y Inter para texto.
- **Responsive:** diseñado para monitores de escritorio, tabletas y teléfonos. Se validó con el modo responsive del navegador (1440, 820 y 390 px); no se probó en dispositivos físicos por decisión del dueño.
- **Accesibilidad:** puntuación 100 en Lighthouse, respeto de `prefers-reduced-motion` (sin preloader ni movimiento), contenido visible sin JavaScript, enlace para saltar al contenido.
- **Marca:** el logo de los tres michis es la imagen principal; el nombre se dibuja con un SVG trazado a partir del logo original (`wordmark-script.svg` y `wordmark-sub.svg`).

## Alternativas consideradas

- Fondo oscuro en todo el sitio: se descartó porque cansa en lectura larga y resta contraste a las fotos de tortas.
- Paleta clara con acentos pastel: se descartó porque el logo neón pierde fuerza.

## Consecuencias

- Los tokens de color se definen una sola vez en `@theme`; no se usan colores sueltos en las vistas.
- Las fotos de tortas (fondos claros) conviven bien con las secciones crema.
