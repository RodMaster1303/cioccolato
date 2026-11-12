# 0012. Preloader en dos fases y entrega de los michis al hero

**Estado:** Aceptada (2026-11-12). Amplía el [ADR 0004](0004-preloader-el-ovillo-escribe-el-logo.md).

## Contexto

El preloader anterior esperaba a que cargaran las imágenes de los gatos antes de mostrar algo con sentido, dejaba ver una rayita suelta del logo al empezar y terminaba con un corte: los gatos del preloader desaparecían y los del hero aparecían en otro lugar. El dueño pidió además que el preloader se vea siempre; se descarta la idea de saltarlo durante 7 días.

## Decisión

- **Dos fases.** La fase 1 (`intro-run`) no descarga nada: el ovillo, incrustado en la página como imagen en línea de 2,8 KB, escribe el logo en SVG. La fase 2 (`intro-cast`) hace entrar a los tres michis solo cuando sus imágenes ya cargaron.
- **Paciencia acotada.** Tras el logo (1250 ms) se espera a las imágenes hasta 1800 ms. Si no llegan, el preloader se cierra sin gatos en lugar de retener al visitante.
- **Entrega al hero.** Al cerrar, cada michi del preloader vuela hasta la posición exacta de su par en el hero (técnica FLIP con la Web Animations API, 760 ms) y los del hero quedan ocultos hasta el aterrizaje. Al terminar se emite el evento `intro:done`, que arranca las rutinas del hero (saltito, saludo de Pivi, postres que rebotan).
- **Siempre visible en la primera carga y en cada recarga.** Solo se omite al navegar entre páginas del mismo sitio y con movimiento reducido. Se puede saltar con Escape o con un toque.
- **En páginas internas** corre igual, sin entrega (no hay hero): los gatos se despiden y el telón se abre.
- **Lo que queda bajo el telón no se pinta antes.** El arte del encabezado y el michi asomado del formulario permanecen ocultos mientras dura el telón y entran con su animación al abrirse.

## Medición

Chrome sin interfaz, servidor local, tiempos desde el inicio de la navegación:

| Perfil | Empieza el logo | Entran los michis | Cierre y vuelo | Fin |
|---|---|---|---|---|
| Escritorio | 253 ms | 1504 ms | 3067 ms | 3978 ms |
| Móvil | 135 ms | 1371 ms | 2937 ms | 3863 ms |
| Tablet | 198 ms | 1445 ms | 3010 ms | 3956 ms |
| Móvil lento (CPU x4, 1,6 Mbps) | 789 ms | 2503 ms | 4074 ms | 4999 ms |
| Página interna, móvil | 203 ms | 1417 ms | 2984 ms (sin vuelo) | 3892 ms |

Sin errores de consola en ningún perfil. Tras el cierre el preloader queda con `display: none` y sin animaciones corriendo.

## Alternativas consideradas

- **Saltar el preloader durante 7 días tras la primera visita.** Descartada por decisión del dueño.
- **Preloader corto, solo con el logo, en páginas internas.** No se adoptó: cambia lo que el dueño pidió ver. Queda como opción si se quiere acortar la espera al entrar directo a una página interna.
- **Transición de vista nativa entre preloader y hero.** Descartada: el preloader y el hero viven en el mismo documento y el vuelo necesita controlar el recorrido en arco.

## Consecuencias

- El primer contenido útil aparece antes: el logo se dibuja sin esperar descargas.
- En redes muy lentas el visitante puede ver solo el logo. Es deliberado.
- Las métricas de laboratorio (Lighthouse) no ven el telón: miden lo que se pinta debajo. Sirven para comparar versiones, no describen la espera real de la primera visita, que es de unos 4 segundos.
