# 0013. Escena de scroll con los tres michis

**Estado:** Aceptada (2026-11-12).

## Contexto

La escena de scroll de la portada mostraba solo a Pivi persiguiendo un ovillo. Tenía saltos de tamaño al cambiar de pose (cada imagen tenía proporciones distintas), el texto final se encimaba con el inicial, el hilo usaba un filtro costoso y en pantallas apaisadas la escena se montaba sobre el texto.

## Decisión

- **Tres actos por turnos**, guiados por el avance del scroll dentro de una sección de 400svh con escenario fijo:
  1. Pivi entra por la izquierda, mira caer su ovillo rosa, se agazapa y lo persigue hasta la derecha.
  2. Mandarino hace lo mismo en sentido contrario con el ovillo naranja.
  3. Zombie camina al centro; su ovillo celeste cuelga como péndulo, lo manotea, salta, lo atrapa y lo deja caer.
  Al final los tres duermen junto a sus ovillos y aparece el mensaje de cierre con el botón de WhatsApp.
- **Lienzos normalizados.** Se usan las imágenes de `src/assets/cats/` (808 x 808, cuerpo centrado), así el michi no cambia de tamaño entre poses. Poses en uso: mirar arriba, agazapado, salto, caminar, zarpazo y dormir, para los tres.
- **Avance amortiguado.** El progreso se suaviza cuadro a cuadro (interpolación del 16% por cuadro) y el bucle se detiene al llegar al objetivo.
- **Solo transformaciones.** Michis y ovillos se mueven con `translate3d`. Los hilos son trazos SVG dobles (línea y halo), sin filtros, en su propia capa de composición. Solo se reescribe el atributo cuando cambia.
- **Texto en secuencia.** El texto inicial se oculta antes de que entre el final. Una etiqueta indica de quién es el turno.
- **Versión estática** con movimiento reducido, sin JavaScript o con pantallas de menos de 480 px de alto: sección de altura normal con los tres michis dormidos y el mensaje final.
- El guion vive en `src/scripts/interlude.ts`; el marcado y los estilos en `src/components/home/Interlude.astro`.

## Medición

- Escena aislada en móvil con CPU x4, tres corridas: entre 0,6% y 2,4% de cuadros por encima de 34 ms; peor cuadro entre 50 y 67 ms. Quitar los hilos o el fondo no cambia el resultado, así que no son el costo dominante.
- Portada completa en escritorio: 0,2% de cuadros por encima de 34 ms.
- Portada completa en móvil con CPU x4: 3,3% y 8,4% en dos corridas con el mismo código (la versión publicada dio 2,4% en una corrida). La medición de la página completa es ruidosa (probablemente por la primera carga de imágenes durante el recorrido, no verificado) y no permite afirmar ni mejora ni empeoramiento.

## Alternativas consideradas

- **Animaciones guiadas por scroll en CSS (`animation-timeline`).** Descartadas para esta escena: el recorrido depende de medidas del escenario y del cambio de poses, y su soporte es muy reciente en Safari (26) y Firefox (159).
- **Hilo recto hecho con un `div` transformado.** Más barato de pintar, pero pierde la comba del hilo. La medición mostró que el SVG no es el cuello de botella.
- **Una biblioteca de animación (GSAP ScrollTrigger).** Descartada: suma unos 41 KB comprimidos para algo que cabe en un script propio.

## Consecuencias

- La escena descarga 18 imágenes de michis (6 poses por 3). Se piden en diferido y pasan a carga inmediata cuando la sección se acerca.
- Cada pose intermedia dura pocos píxeles de scroll; con scroll muy rápido algunas apenas se perciben.
- Textos nuevos en ambos idiomas: `interlude_title`, `interlude_text`, `interlude_turn`, `interlude_end_title`, `interlude_end_text`.
