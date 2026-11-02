# 0001. Astro estático, Tailwind v4 e i18n ES/EN

**Estado:** Aceptada (2026-11-01)

## Contexto

El sitio anterior era una plantilla Bootstrap estática en la raíz del repositorio. Hacía falta rehacerlo con mejor rendimiento y SEO, en español (idioma principal) e inglés, con imágenes optimizadas y animaciones propias. Los proyectos previos del autor (taxi, energía solar, portafolio) sirvieron de referencia para el nivel de acabado.

## Decisión

- **Astro 7 con salida estática.** Cada página se genera en el build y casi no se envía JavaScript: el sitio publicado tiene 4 archivos `.js` que suman 8 KB.
- **Tailwind v4** con el plugin `@tailwindcss/vite`. Los colores, tipografías y curvas de easing viven como tokens en el bloque `@theme` de `src/styles/global.css`.
- **TypeScript estricto**, iconos con `@lucide/astro`, mapa del sitio con `@astrojs/sitemap`.
- **Fuentes** Inter (400 a 700) y Fraunces (600 y 700) con la API de fuentes de Astro y el proveedor fontsource, precargadas desde el propio dominio.
- **Internacionalización propia y mínima.**
  - Español en `/`, inglés en `/en/`.
  - Rutas con nombre localizado: `servicios`, `galeria`, `carta`, `nosotros`, `contacto` frente a `services`, `gallery`, `menu`, `about`, `contact`. Una sola plantilla `src/pages/[...path].astro` genera todas.
  - Textos en `src/i18n/es.json` y `src/i18n/en.json`. El build y `npm test` fallan si falta una clave en cualquiera de los dos.
  - SEO por idioma: `hreflang`, `canonical`, `og:locale`, datos estructurados `Bakery` y `FAQPage`.
- **Pruebas** con `node --test` (`tests/*.test.mjs`): paridad de claves i18n, armado del mensaje de WhatsApp y consistencia de la galería.

## Alternativas consideradas

- **Mantener Bootstrap.** Descartada: el rediseño pedía un lenguaje visual propio y animaciones que la plantilla no soporta bien.
- **Next.js o React completo.** Descartada: sitio de contenido sin estado compartido, el JavaScript extra no aporta.
- **Astro con islas de React y GSAP (como el portafolio).** Descartada: las animaciones se resuelven con CSS y un par de scripts pequeños en TypeScript.
- **Librería de i18n.** Descartada: dos idiomas y poco más de 200 claves no justifican la dependencia.

## Consecuencias

- Cada texto nuevo exige su clave en los dos idiomas; las pruebas lo hacen cumplir.
- El 404 es una sola página en español con botón al inglés, porque el servidor estático no sabe el idioma del visitante.
- Las páginas inglesas y españolas no se enlazan por plantilla común de slug: el cambio de idioma usa la tabla de rutas de `src/i18n/index.ts`.
