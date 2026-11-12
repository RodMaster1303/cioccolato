# 0014. Sistema de movimiento y dinamismo

**Estado:** Aceptada (2026-11-12). Respeta el [ADR 0006](0006-presupuesto-de-rendimiento-de-animaciones.md).

## Contexto

El dueño pidió un sitio más dinámico y con aspecto más cuidado. El análisis previo encontró además fallas concretas: la aparición por transición pisaba el efecto al pasar el cursor en tarjetas, el menú móvil, el visor de fotos y las preguntas frecuentes se abrían de golpe, y el título del hero dejaba una palabra suelta.

## Decisión

Todo se resuelve con CSS y funciones del navegador, sin bibliotecas de animación. Cada pieza degrada sola: si el navegador no la soporta, el contenido se ve igual, sin el efecto.

| Pieza | Cómo | Soporte verificado (MDN) |
|---|---|---|
| Aparición al entrar en pantalla | Animaciones (`reveal-up`, `zoom`, `left`, `right`) en lugar de transiciones | Universal |
| Entrada al cargar (`data-enter`) | Se repite cuando termina el preloader | Universal |
| Títulos palabra por palabra | Componente `Words` y clase `.words` | Universal |
| Rebote | `linear()` como curva de resorte | Chrome 113, Safari 17.2, Firefox 112 |
| Chorreados de chocolate entre secciones | Componente `Drip`: SVG en línea como fondo repetido, crece con `scaleY` | Universal |
| Transición entre páginas | `@view-transition { navigation: auto }` | Chrome 126, Safari 18.2, Firefox no |
| Filtro de galería animado | `document.startViewTransition` | Chrome 111, Safari 18, Firefox 144 |
| Menú móvil con apertura circular | `@starting-style` y `transition-behavior: allow-discrete` | Chrome 117, Safari 17.5, Firefox 129. El cierre animado depende de `overlay` (solo Chrome 117) |
| Preguntas frecuentes con altura animada | `::details-content` e `interpolate-size` | `::details-content`: Chrome 131, Safari 18.4, Firefox 143. `interpolate-size`: solo Chrome 129 |
| Fotos con deriva al hacer scroll | `animation-timeline: view()` | Chrome 115, Safari 26, Firefox 159 |
| Cambio de foto en el visor | Animación con dirección según se avance o retroceda | Universal |
| Precarga de páginas al pasar el cursor | `prefetch` de Astro | Universal (Astro usa `fetch` donde falta `rel=prefetch`) |

Reglas que se mantienen:

- En animaciones continuas solo se animan `transform` y `opacity`.
- Con movimiento reducido no hay preloader, ni transición entre páginas, ni escena de scroll animada; los elementos quedan en su estado final.
- Sin JavaScript todo el contenido es visible.

## Medición

Lighthouse móvil sobre el servidor local de la compilación (sin compresión, por eso no es comparable con producción). Entre paréntesis, la versión publicada medida en ese mismo servidor.

| Página | Rendimiento | LCP |
|---|---|---|
| Portada | 100 (88) | 1,2 s (3,7 s) |
| Galería | 100 (82) | 1,0 s (4,9 s) |
| Carta | 100 (82) | 1,0 s (4,9 s) |
| Contacto | 99 (96) | 1,0 s (2,7 s) |
| Nosotros | 100 | 1,0 s |
| Servicios | 100 | 1,0 s |

Accesibilidad, buenas prácticas y SEO en 100 en las seis; CLS 0. Portada en escritorio: 100. Estos números son de laboratorio y no ven el telón del preloader (ver ADR 0012).

Se corrigieron de paso dos avisos de accesibilidad que ya existían: el nombre accesible del botón de idioma no contenía su texto visible, y la página de Servicios saltaba de `h1` a `h3`.

## Alternativas consideradas

- **GSAP, Lenis o Motion.** Descartadas: entre 5 y 41 KB comprimidos cada una y nada de lo pedido lo requiere.
- **Servicios con fotos (rejilla tipo bento).** No se hizo: no está verificado qué foto corresponde a cada uno de los ocho servicios. Queda propuesta.
- **Michis articulados con WebGL en el hero.** No se hizo en esta tanda: riesgo alto de fallas visuales y de rendimiento. Queda propuesta en el [ADR 0009](0009-mejoras-futuras.md).

## Consecuencias

- El peso de la portada en móvil sube de 540 KB a 605 KB (más imágenes de michis); el de la galería baja de 2098 KB a 1051 KB por la corrección del atributo `sizes` de las fotos.
- Firefox no muestra la transición entre páginas ni el cierre animado del menú; Safari no anima la altura del acordeón. El contenido funciona igual.
- La primera foto de la Carta y el arte del encabezado se cargan con prioridad alta.
