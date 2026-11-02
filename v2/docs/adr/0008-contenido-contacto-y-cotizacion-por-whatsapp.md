# 0008. Contenido, contacto y cotización por WhatsApp

**Estado:** Aceptada (2026-11-01)

## Contexto

Cioccolato es una pastelería y catering de La Paz y El Alto, Bolivia. No tiene correo electrónico propio ni sistema de pedidos en línea; todo se resuelve por WhatsApp. El sitio debe convertir visitas en consultas sin inventar datos.

## Decisión

Datos del negocio (única fuente: `src/data/site.ts` y `src/i18n/*.json`):

- **Teléfono y WhatsApp:** un solo número, 68023352, con enlace `wa.me/59168023352`. Es el único contacto válido; no hay correo.
- **Local:** Calle Colón, frente al banco BNB, en la Feria Nuestra Bolivia, La Paz. Enlace de Google Maps incluido.
- **Horario del local:** lunes a viernes de 10:00 a 19:00. Los pedidos y cotizaciones por WhatsApp se responden también fuera de ese horario, y el sitio lo aclara.
- **Experiencia:** "30 años de experiencia internacional", por indicación del dueño. La zona de entrega sigue siendo La Paz y El Alto.
- **Pedidos:** con 3 días a una semana de anticipación. Pago en efectivo, por transferencia o con QR.
- **Carta:** categorías de la versión anterior (tortas, bodas, cocktail, buffet, bebidas), sin precios. Cada ítem admite un campo opcional `price` para cuando se quiera mostrar.
- **Fuera de la primera versión:** testimonios (se agregarán más adelante, reales) y Instagram (el enlace queda oculto hasta tener la URL).
- **Crédito:** el pie dice "Desarrollado por Josue Chura" y enlaza a su portafolio (URL distinta por idioma).

Cotización:

- El formulario de contacto no tiene servidor. Valida los campos (tipo de evento, fecha, personas; nombre y mensaje opcionales), arma el mensaje con la plantilla del idioma activo y abre `wa.me` con el texto ya escrito. No guarda datos.
- Avisa si la fecha está a menos de 3 días (permite enviar igual) y rechaza fechas pasadas.
- El mensaje se recorta a 1500 caracteres y omite las líneas con campos vacíos.

## Alternativas consideradas

- **Formulario con envío por correo o a un backend.** Descartada: no hay correo del negocio y habría que guardar datos personales.
- **Solo un botón de WhatsApp sin formulario.** Descartada: el formulario hace que el mensaje llegue con fecha, tipo de evento y cantidad de personas.
- **Mostrar precios.** Descartada: cambian con cada pedido.

## Consecuencias

- Cambiar teléfono, horario o dirección implica tocar un solo archivo de datos y los textos de ambos idiomas.
- Pendiente de decisión del dueño: la versión en inglés envía el mensaje de WhatsApp en inglés. Si el local prefiere recibir siempre español, basta cambiar la plantilla `quote_template` y los textos de mensaje por defecto en `en.json`.
