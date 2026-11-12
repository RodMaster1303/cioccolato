# 0015. Michis con lienzo normalizado, rutinas automáticas y uso en todas las vistas

**Estado:** Aceptada (2026-11-12). Amplía el [ADR 0010](0010-todas-las-poses-de-los-michis-en-uso.md).

## Contexto

El ADR 0010 dejó todas las poses referenciadas en alguna página, pero el dueño pidió que se vean de verdad en móvil, tablet y PC. La revisión por vista encontró tres huecos: el arte del encabezado estaba oculto en móvil (ahí no se veían `trio-gatos` ni `trio-postres`), `trio-completo` no se usaba en ninguna página, y varias poses solo aparecían si el visitante tocaba o pasaba el cursor. Además, los michis de varias poses cambiaban de tamaño al cambiar de pose (pie de página, tarjetas, página 404).

## Decisión

- **Lienzo normalizado para todo michi con más de una pose.** El componente `Michi` usa las imágenes de `src/assets/cats/` cuando recibe varias poses y las escala para que el cuerpo llene la caja. Con una sola pose (por ejemplo `peek`) sigue usando el recorte original.
- **Rutinas automáticas** (`src/scripts/michis.ts`), solo cuando el michi está en pantalla y sin movimiento reducido: parpadeo, miradas alternadas a izquierda y derecha, maullido con globo por turnos y, en la página 404, salto. En el hero las miradas recorren todas las combinaciones de michi y dirección antes de repetir, y cualquier michi puede maullar.
- **Arte del encabezado visible también en móvil**, más pequeño y bajo el texto.
- **`trio-completo` como sello de marca** en el pie de página, en todas las páginas.
- **Michis asomados en la portada**: Pivi y Mandarino sobre la rejilla de servicios, Zombie sobre la galería. Se corrigió su alineación para que se apoyen en el borde de la tarjeta.
- **Banda final con un michi y una pose distintos por página.**
- **Dos auditorías repetibles**: `npm run check:sprites` (55 imágenes referenciadas en el HTML compilado, ahora incluye `trio-completo` y `pivi-mark`) y una revisión por vista con un navegador real.

## Medición

- **Presencia por vista** (móvil 390 px, tablet 820 px, escritorio 1440 px, ocho páginas, menú móvil abierto donde existe): 55 de 55 imágenes con caja visible en las tres.
- **Pintado real sin interacción en la portada** (se muestrea la pantalla mientras corre el preloader, se espera en el hero y se recorre la página): 36 de 36 caras en escritorio y en tablet. En móvil, 35 de 36 en cada corrida, con una cara distinta faltante cada vez por el intervalo de muestreo y los tiempos al azar de las rutinas; entre corridas se vieron las 36. `pivi-peek` aparece en la portada desde este cambio.

## Alternativas consideradas

- **Dejar las poses extra solo por interacción.** Descartada: en pantallas táctiles muchas no se llegaban a ver.
- **Normalizar también `peek`.** No hace falta: es una sola pose por michi y no cambia de tamaño.

## Consecuencias

- Las tarjetas de los michis descargan cinco poses cada una en lugar de dos. Comparten archivo con el hero, así que en la portada ya están en caché.
- Las rutinas usan temporizadores; se detienen solas cuando el michi sale de pantalla o la pestaña queda oculta.
- Si se agrega una pose nueva hay que sumarla a `tools/build_cat_poses.py` y a la lista de `tools/check-sprites.mjs`.
