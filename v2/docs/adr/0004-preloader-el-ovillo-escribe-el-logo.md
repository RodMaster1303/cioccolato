# 0004. Preloader: el ovillo escribe el logo

**Estado:** Aceptada (2026-11-01)

## Contexto

La primera versión del preloader mostraba el trío como una sola imagen que aparecía por máscaras y un nombre que se descubría con un barrido. El dueño lo sintió básico. Se propusieron alternativas y eligió la que cuenta una historia corta con los tres michis.

## Decisión

Escena de unos 3,4 segundos, hecha solo con CSS (componente `src/components/layout/Preloader.astro`):

1. Los tres gatos aparecen con rebote: Pivi al centro, Mandarino a la izquierda y Zombie a la derecha.
2. Mandarino bate un ovillo rosado (pose `swipe`). El ovillo rueda por el piso con tres saltitos y deja un hilo de colores; a su paso se descubre "Cioccolato".
3. Pivi sigue el ovillo con la mirada (`look-left` y luego `look-right`). Zombie espera agazapada (`crouch`) y al final salta sobre el ovillo (`pounce`). Las poses de Zombie van espejadas para que mire a la izquierda.
4. Chispas al atrapar el ovillo, maullido de Pivi y Zombie, aparecen cuatro postres, entra "Pastelería", pasa un destello y se abre el telón.

Comportamiento:

- Arranca cuando sus imágenes terminaron de cargar, con un máximo de 2 segundos de espera, para no mostrar gatos a medias en redes lentas. La clase `intro-run` del `<html>` dispara las animaciones.
- Se salta con Esc o con un clic. Ya no hay texto de ayuda en pantalla.
- Solo se muestra en la primera carga o al recargar. No se muestra al navegar entre páginas del sitio ni con `prefers-reduced-motion`. Se pausa si la pestaña está oculta.
- Las imágenes son `loading="lazy"` dentro de un contenedor oculto, de modo que no se descargan cuando el preloader no se va a mostrar.
- El descubrimiento del nombre usa un panel del color del fondo que se desliza (en lugar de máscara o `clip-path` animados), y el brillo del nombre es un filtro estático. Ver ADR 0006.

## Alternativas consideradas

- **Stop-motion de poses.** La más barata, pero la mejora era moderada.
- **Cocina animada** (los gatos entran caminando y tiran un macaron). Más cómica, pero más larga, y un preloader largo molesta.
- **Lottie o Rive.** Los gatos son imágenes, no vectores; habría que redibujarlos.
- **Video o sprites animados generados con una herramienta de video.** El más realista, pero pesado, con riesgo de que los gatos no se vean iguales entre cuadros, y el fondo transparente en video es complicado entre navegadores.
- **Hilo que traza la caligrafía exacta del nombre.** Requería extraer el trazo central de la letra cursiva; riesgo alto de verse mal frente a una escena equivalente mucho más simple.

## Consecuencias

- Se cargan unas 20 imágenes pequeñas al inicio; es la principal razón por la que el LCP móvil de laboratorio es mayor que con una sola imagen (ADR 0006).
- Cambiar el guion implica editar la tabla de poses y tiempos en el frontmatter del componente.
- El preloader depende de que las poses existan en `src/assets/cats` (ADR 0003).
