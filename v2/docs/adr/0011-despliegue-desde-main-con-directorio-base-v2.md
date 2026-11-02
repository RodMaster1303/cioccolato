# 0011. Despliegue desde `main` con directorio base `v2`

**Estado:** Aceptada (2026-11-02). Reemplaza al [ADR 0007](0007-despliegue-en-netlify-desde-v2.md).

## Contexto

El ADR 0007 proponía trabajar en la rama `feat/v2-astro`, un `netlify.toml` en la raíz del repositorio con `base = "v2"` y fusionar la rama a `main` como corte. El dueño decidió otra cosa: sin ramas, todo el trabajo va directo a `main`, el sitio nuevo vive en la carpeta `v2/`, la versión vieja se queda en el repositorio sin publicarse, y él mismo le indica a Netlify desde su panel que despliegue `v2`.

## Decisión

- **Todo el sitio nuevo y su configuración viven dentro de `v2/`**, incluido `v2/netlify.toml`. Netlify busca el archivo de configuración en el directorio del paquete, luego en el directorio base y por último en la raíz; con la base en `v2` lo encuentra ahí ([documentación](https://docs.netlify.com/build/configure-builds/file-based-configuration/)).
- **`v2/netlify.toml` no declara `base`.** El directorio base se fija en el panel de Netlify, no en el archivo. El archivo trae el comando (`npm run build`), la carpeta publicada (`dist`, relativa a la base), Node 22, `PUBLIC_NOINDEX=1` solo en vistas previas y las cabeceras de caché y seguridad (ver ADR 0007, que sigue describiendo su contenido).
- **Se despliega desde `main`.** No se usan ramas de trabajo; los commits van directo a `main`.
- **La versión vieja se conserva** en la raíz del repositorio (`index.html`, `css`, `js`, `img`...). No se publica porque Netlify construye dentro de `v2/`.
- **Un push a `main` no cambia el sitio publicado hasta que el dueño fije la base.** Sin la base en `v2`, Netlify sigue con su configuración actual y publica lo mismo que hoy. El cambio ocurre cuando el dueño lo decide en el panel.

## Procedimiento para activar el sitio nuevo

1. Netlify, sitio `cioccolato`, Site configuration, Build & deploy, Build settings, Edit settings.
2. **Base directory:** `v2`. Dejar vacíos Build command y Publish directory, o dejar `npm run build` y `dist`; el archivo `v2/netlify.toml` tiene prioridad.
3. Guardar y lanzar Deploys, Trigger deploy, Deploy site (o hacer el siguiente push a `main`).
4. Verificar: el sitio carga, `/en/` funciona, `/sitemap-index.xml` y `/robots.txt` responden, y el código fuente no contiene `noindex`.

Reversión inmediata: Deploys, abrir el deploy anterior (el sitio viejo) y pulsar "Publish deploy". Para volver del todo, vaciar la Base directory.

## Alternativas consideradas

- **Mantener `netlify.toml` en la raíz con `base = "v2"`** (ADR 0007). Descartada por decisión del dueño: un push a `main` publicaría el sitio nuevo de inmediato, sin que él lo active.
- **Ramas de trabajo con Pull Request.** Descartada por decisión del dueño: el repositorio es suyo y prefiere publicar desde `main`.

## Consecuencias

- Cada push a `main` con la base en `v2` publica en producción. No hay revisión previa; conviene correr `npm run check`, `npm test` y `npm run build` antes de empujar.
- Las vistas previas por rama dejan de ser el camino normal; la variable `PUBLIC_NOINDEX` queda lista por si se vuelven a usar.
- Si se cambia el dominio hay que actualizar `site` en `astro.config.mjs` y `Sitemap` en `public/robots.txt`.
- Con el sitio viejo en la raíz, cualquier archivo nuevo del repositorio fuera de `v2/` no afecta al sitio publicado.
