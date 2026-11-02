# 0006. Presupuesto de rendimiento de las animaciones

**Estado:** Aceptada (2026-11-01)

## Contexto

La meta original era una puntuación de rendimiento de 95 o más en Lighthouse móvil con las animaciones de los michis. Con el trío como una sola imagen estática se llegó a 94 en móvil y 99 a 100 en escritorio. La primera versión animada cayó a 52 a 62 en móvil (TBT de 790 ms en una medición): cada cuadro de la animación forzaba cálculo de estilos y repintado en el hilo principal.

## Decisión

Reglas para toda animación del sitio:

1. **Solo `transform` y `opacity` en animaciones continuas.** Esas propiedades las anima el compositor sin tocar el hilo principal.
2. **Sin propiedades personalizadas registradas animadas** (`@property` con `inherits: true`). La primera versión del preloader animaba una variable `--p` para sincronizar la bola, el hilo y el descubrimiento del nombre; recalculaba estilos de todo el subárbol en cada cuadro. Ahora cada elemento tiene su propia animación de `transform` con la misma curva y duración.
3. **Sin `box-shadow` ni `filter` animados.** El pulso del botón de WhatsApp animaba `box-shadow` (repintado continuo en todas las páginas); ahora es un `::after` que escala y se desvanece. Los resplandores de los sprites van horneados en la imagen.
4. **Bucles decorativos en pausa mientras corre el preloader** (flotado, respiración, halo, marquesina, pulso del botón), porque están ocultos detrás del telón.
5. **Imágenes ligeras donde se muestran pequeñas:** las poses se generan en 240, 360, 540 y 720 px de ancho con calidad 66, de modo que un teléfono baja la de 240.
6. **Las imágenes que cambian después de cargar no pueden ser candidatas a LCP** (poses extra 1 px más pequeñas).
7. Toda animación nueva debe respetar `prefers-reduced-motion` y no bloquear el contenido.

## Resultados medidos (sitio construido y servido en local)

- Escritorio: rendimiento 97 a 99; accesibilidad, buenas prácticas y SEO en 100.
- Móvil con red lenta simulada: entre 72 y 88, según la carga de la máquina de pruebas (una medición contaminada dio 44). Bloqueo del hilo principal (TBT) entre 0 y 340 ms en mediciones normales. Peso total de la página en la primera visita: unos 540 KiB.
- El LCP móvil de laboratorio (3,5 a 4,5 s) depende de la red: hay muchas imágenes pequeñas antes del primer pintado. La meta de 95 en móvil no se cumple y se aceptó a cambio de las animaciones; el dueño aprobó el resultado visual.
- Las imágenes del sitio pasan las auditorías de formato moderno, tamaño adecuado, dimensiones declaradas y carga diferida. Queda una estimación de ahorro de unos 46 KiB por tamaño de las poses en móvil.

## Alternativas consideradas

- Quitar el preloader o acortarlo: descartado, es parte central de la identidad.
- Mover animaciones a WebGL o canvas: más costo de CPU y complejidad para lo que se logra con CSS.

## Consecuencias

- Antes de aceptar un cambio visual con movimiento hay que volver a medir con Lighthouse en móvil, cerrando otros navegadores, porque la medición varía mucho con la carga de la máquina.
- La mejora pendiente más rentable es reducir peticiones con una hoja de sprites por gato (ADR 0009).
