# 0005. Hero: gatitos vivos

**Estado:** Aceptada (2026-11-01)

## Contexto

El hero original era una imagen plana del trío que flotaba y se movía un poco con el mouse. Los gatos no hacían nada. El dueño pidió animaciones más ricas y, entre las alternativas, aprobó la de gatos con vida propia hecha con las poses que ya existen.

## Decisión

El trío se arma con los sprites individuales (componente `HeroTrio.astro`, comportamiento en `src/scripts/hero-cats.ts`, poses de `src/assets/cats`) y nueve golosinas sueltas alrededor, cada una con su propio flotado y profundidad de parallax.

Comportamiento de los gatos:

- **Respiran** con un movimiento muy leve y **parpadean** de forma aleatoria cada 2,3 a 5,6 segundos, a veces dos veces seguidas.
- **Siguen el cursor con la mirada** (`look-left`, `look-right`, `look-up` según dónde esté el puntero respecto a cada gato).
- **Maúllan al tocarlos** (clic o toque): pose `meow`, burbuja con el texto del idioma, salto, chispas, y los otros dos giran a mirarlo. Las golosinas también se pueden tocar: rebotan, sueltan chispas y los gatos las miran.
- **Se duermen** tras 24 segundos sin actividad con el hero visible: pose `sleep` en cadena y "Zzz". Se despiertan con un salto al primer movimiento.
- **Miran alrededor solos** cuando el puntero lleva más de 3,5 segundos quieto, y en pantallas táctiles, donde no hay cursor.
- **Saludan:** al abrirse el telón del preloader, Pivi maúlla. Sin preloader, saluda poco después de cargar.
- **Parallax** con el mouse en escritorio, limitado a un cuadro de animación por vez.
- Con `prefers-reduced-motion` se ven quietos en la pose `sit` y no se arma ningún temporizador.

Carga de imágenes: al inicio solo se descargan las 3 poses `sit`. Las demás poses (`basic`) se activan en reposo después del evento `load` y las de sueño (`late`) a los 9 segundos. Una pose solo se muestra si su imagen ya terminó de cargar, y las poses extra miden 1 px menos que `sit` para no convertirse en candidatas a LCP.

El conjunto es decorativo: el contenedor es una imagen con descripción (`role="img"`) y los gatos no reciben foco de teclado.

## Alternativas consideradas

- **Escena 2.5D con WebGL y mapas de profundidad.** Se ve premium, pero pesa más y puede ir lenta en teléfonos baratos.
- **Video o sprites animados externos.** Realista, pero pesado, difícil de mantener consistente y con transparencia complicada.
- **Mantener la imagen única del trío.** Más liviana, pero sin vida.

## Consecuencias

- La composición ya no es una sola imagen: las posiciones y tamaños de cada gato y golosina se definen en `HeroTrio.astro`.
- Las 21 poses por gato más las golosinas suman peticiones; se mitiga cargando las extras tras `load` (ADR 0006).
- El trío del logo oficial (`trio-gatos.webp`, `trio-postres.webp`, `trio-completo.webp`) sigue en `src/assets/brand` y se usa para la imagen de redes.
