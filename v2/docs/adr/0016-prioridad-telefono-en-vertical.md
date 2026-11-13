# 0016. Prioridad al teléfono en vertical

**Estado:** Aceptada (2026-11-13).

## Contexto

El dueño indicó que la mayoría de las visitas llegará desde teléfonos en vertical y que ahí el sitio tiene que lucir mejor que en ningún otro tamaño. La revisión de la portada a 390 px de ancho mostró: 16 pantallas de largo, de las cuales 3,2 eran ocho tarjetas de servicios apiladas; el trío del hero ocupaba el 70% del ancho; el botón flotante de WhatsApp tapaba los botones del hero y a un michi dormido en la escena de scroll; y varios enlaces medían entre 17 y 20 px de alto.

## Decisión

Todo lo siguiente aplica por debajo de 640 px. Tablet y escritorio no cambian.

- **Hero.** El trío pasa al 84% del ancho, con tope del 48% de la altura visible. Menos aire arriba y entre textos. Los tres chips van en una sola fila que se desliza con el dedo. Los botones entran con rebote en lugar de fundido.
- **Paralaje al hacer scroll.** En pantallas táctiles los postres y los michis del hero se desplazan según su profundidad mientras se baja, con la misma variable que en escritorio mueve el cursor.
- **Servicios en carrusel** (solo en la portada): tarjetas al 78% del ancho con ajuste por tarjeta, la siguiente asomada y puntos de posición. La página de Servicios conserva la lista completa.
- **Cómo trabajamos como línea de tiempo:** icono a la izquierda, texto a la derecha y una línea que se dibuja al hacer scroll.
- **Escena de scroll:** michis de 140 px (antes 121) y posiciones finales 18%, 50% y 82% para que no se toquen.
- **Botón flotante de WhatsApp:** se oculta mientras el hero, la escena de scroll o el botón de la banda final están en pantalla, porque ahí ya hay un botón para escribir.
- **Zonas de toque:** enlaces del pie, «Cómo llegar», teléfono, marca del pie y «Cotizar» de cada servicio con 44 px de alto como mínimo. La navegación del pie va en dos columnas.
- **Respuesta al toque:** tarjetas y chips se hunden al presionar; vibración breve al tocar a un michi del hero donde el navegador la permite.
- **Encabezado de páginas internas** más compacto.

## Medición

Chrome emulando un teléfono, servidor local de la compilación.

- **Largo de la portada** a 390 x 844: de 13 482 px a 10 822 px (20% menos).
- **Hero** a 390 x 844: trío, título, texto y los dos botones dentro de la primera pantalla. A 390 x 664 (altura visible habitual con las barras del navegador) entran el trío y el título; los botones quedan en la segunda pantalla.
- **Carrusel:** tarjeta de 273 px sobre 390; los puntos marcan 1, 4 y 8 al desplazarlo; las tarjetas que entran se muestran.
- **Botón flotante:** oculto en hero, escena y banda final; visible en servicios, pasos y pie.
- **Desborde horizontal:** ninguno a 360, 390 y 412 px.
- **Imágenes:** 55 de 55 con caja visible a 360, 412, 820 y 1440 px.
- **Lighthouse móvil, portada, tres corridas:** rendimiento 96, 100 y 100; accesibilidad, buenas prácticas y SEO 100; CLS 0.
- **Peso de la primera carga** de la portada en Lighthouse móvil: 916 KB (antes de este cambio, 605 KB). La página es más corta, y entre lo que ahora se descarga en esa primera carga hay 13 fotos de la galería (187 KB) que antes quedaban lejos. No es peso nuevo del sitio, pero sí llega antes.
- **Escena de scroll con CPU x4:** entre 0% y 0,2% de cuadros por encima de 34 ms en tres corridas.
- Movimiento reducido y sin JavaScript: los botones del hero y todo el contenido siguen visibles.

Se detectó y corrigió en el camino un aviso intermitente de contraste: Lighthouse a veces evaluaba el botón principal a mitad de su fundido de entrada. Con la entrada por rebote, sin transparencia, dio 100 en tres corridas seguidas.

## Alternativas consideradas

- **Tarjetas de los michis en carrusel.** Descartada: son la identidad del sitio y conviene verlas sin tener que deslizar.
- **Barra de navegación fija abajo.** Descartada: el menú y el botón flotante ya cubren ese papel.
- **Paralaje con el giroscopio.** Descartada: en iPhone exige pedir permiso al visitante.
- **Achicar el trío para que los botones entren siempre en la primera pantalla.** Descartada: en teléfonos con barras visibles obligaba a un trío menor que el anterior.

## Consecuencias

- Los servicios quinto a octavo solo se ven deslizando en la portada; el botón «Ver todos los servicios» sigue debajo.
- La línea de tiempo se dibuja con scroll solo donde el navegador soporta `animation-timeline`; en el resto aparece completa.
- La vibración funciona en Android con Chrome; en iPhone no hace nada.
- La primera carga en teléfono trae más imágenes que antes. Si pesa, el siguiente paso es servir los michis en AVIF (ADR 0009).
