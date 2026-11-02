# 0009. Mejoras futuras

**Estado:** Propuesta

## Contexto

Con el preloader y el hero ya aprobados, quedan ideas para seguir mejorando el sitio sin romper el presupuesto de rendimiento (ADR 0006). Este documento las ordena; ninguna está decidida hasta que el dueño la apruebe y se escriba su propio ADR.

## Propuestas

### Rendimiento

1. **Hoja de sprites por gato.** Juntar las poses de cada gato en una sola imagen (con una segunda hoja para las poses tardías) para pasar de unas 20 peticiones a menos de 10 al inicio. Es la mejora con mayor efecto sobre el LCP móvil de laboratorio. Cambia cómo `Cat.astro` muestra una pose (desplazamiento de fondo en lugar de varias imágenes).
2. **Presupuesto en el proceso.** Correr Lighthouse móvil y escritorio antes de cada publicación y registrar el resultado.

### Animaciones

3. **Pivi y el ovillo con el scroll.** La escena de scroll (`Interlude.astro`) ya mueve a Pivi y el ovillo; se puede enriquecer con más poses por tramo y con los otros dos michis reaccionando.
4. **Sección de los michis (`MichisTeam.astro`).** Tarjetas que cambian de pose al pasar el puntero, parpadean y siguen el cursor, con las mismas poses del hero.
5. **Banda de cierre.** Más interacción de Pivi (pose `swipe`) con el botón de cotizar. El pie ya tiene ovillos y saludo (ADR 0010).
6. **Transiciones entre páginas** coherentes con el telón del preloader.

### Contenido

7. **Testimonios reales** con íconos animados, cuando el dueño los entregue.
8. **Enlace de Instagram** en el pie y en contacto, cuando se tenga la URL.
9. **Fotos o íconos** para las categorías Bebidas, Corporativo, Bento y Entrega, que hoy no tienen foto propia.
10. **Selección final de fotos de la galería,** con la aprobación del dueño.
11. **Estado "abierto ahora"** según el horario del local en hora de Bolivia (UTC-4).
12. **Idioma del mensaje de WhatsApp** de la versión inglesa (ver ADR 0008).

### Operación

13. **Retirar el sitio anterior** de la raíz del repositorio una vez estable el nuevo, en un commit aparte.
14. **Proteger `main`** con Pull Request obligatorio (ADR 0007).

## Consecuencias

- Cada propuesta que se apruebe pasa a su propio ADR con estado Aceptada.
- Las ideas de animación deben cumplir las reglas del ADR 0006.
