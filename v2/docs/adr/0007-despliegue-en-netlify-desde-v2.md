# 0007. Despliegue en Netlify desde `v2/`

**Estado:** Reemplazada por el [ADR 0011](0011-despliegue-desde-main-con-directorio-base-v2.md) (2026-11-02)

## Contexto

El repositorio `RodMaster1303/cioccolato` contiene el sitio anterior en la raíz (`index.html`, `css`, `js`, `img`...) y el sitio nuevo en `v2/`. El sitio de Netlify `cioccolato.netlify.app` publica hoy el anterior desde `main`. Se quiere reutilizar el mismo sitio de Netlify (mismo dominio, mismo repositorio) para publicar `v2/`, y que el cambio ocurra solo cuando el dueño lo ordene.

## Decisión

- **`netlify.toml` en la raíz del repositorio**, no dentro de `v2/`, con `base = "v2"`, `command = "npm run build"`, `publish = "dist"` y `NODE_VERSION = "22"`. El archivo manda sobre los campos de la pantalla Build settings de Netlify, así que la configuración queda versionada junto al código.
- **Variable `PUBLIC_NOINDEX=1` solo en los contextos `deploy-preview` y `branch-deploy`.** El layout agrega `<meta name="robots" content="noindex">` cuando la variable está activa, para que las vistas previas no se indexen. Producción no la tiene.
- **Cabeceras:** `/_astro/*` con `Cache-Control: public, max-age=31536000, immutable` (los archivos llevan hash en el nombre) y, para todo el sitio, `X-Content-Type-Options: nosniff` y `Referrer-Policy: strict-origin-when-cross-origin`.
- **Dominio:** se mantiene `cioccolato.netlify.app`. Está declarado en `astro.config.mjs` (`site`) y en `public/robots.txt` (línea `Sitemap`).
- **El corte a producción es la fusión de `feat/v2-astro` en `main`.** No se hace antes de que el dueño lo pida.
- El sitio anterior permanece en la raíz del repositorio; no se publica porque `base = "v2"`. Se puede borrar después en un commit aparte.

## Procedimiento

Vista previa antes del corte (opcional):

1. Netlify, el sitio `cioccolato`, Site configuration, Build & deploy, Continuous deployment, Branches and deploy contexts. En Branch deploys elegir "Let me add individual branches", agregar `feat/v2-astro` y guardar.
2. Con la rama ya subida, el siguiente push (o un Trigger deploy) genera una URL del tipo `feat-v2-astro--cioccolato.netlify.app`; aparece en la pestaña Deploys.
3. Revisar el sitio ahí. No se indexa gracias a `PUBLIC_NOINDEX`.

Corte a producción:

1. En GitHub abrir un Pull Request de `feat/v2-astro` hacia `main` y fusionarlo.
2. Netlify detecta el cambio en `main`, lee `netlify.toml` y publica en `cioccolato.netlify.app`.
3. Verificar: el sitio carga, `/en/` funciona, `/sitemap-index.xml` y `/robots.txt` responden, y el código fuente de producción no contiene `noindex`.

Reversión inmediata: Netlify, Deploys, abrir el deploy anterior y pulsar "Publish deploy". Restituye el sitio viejo sin rehacer nada.

## Alternativas consideradas

- **Crear un sitio nuevo en Netlify.** Descartada: cambia la URL y obliga a configurar todo de nuevo.
- **Configurar base, comando y carpeta solo en la interfaz de Netlify.** Descartada: no queda versionada y es fácil de desalinear.
- **Mover `v2/` a la raíz y borrar el sitio anterior.** Descartada por ahora: pierde el respaldo del sitio viejo y la reversión sencilla.
- **`netlify.toml` dentro de `v2/`.** Descartada: con `base = "v2"` Netlify lee el archivo desde la raíz del repositorio.

## Consecuencias

- Un push a `main` desde cualquier rama publica en producción; conviene proteger `main` con Pull Request.
- Si se cambia el dominio hay que actualizar `site` en `astro.config.mjs` y `Sitemap` en `public/robots.txt`.
- Los builds de Netlify instalan dependencias en `v2/` y generan unas 450 variantes de imágenes; el primer build tarda más que los siguientes por la caché.
