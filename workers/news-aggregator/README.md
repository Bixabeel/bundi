# Abundia.io — Agregador RSS en Cloudflare Workers

Esta carpeta contiene el servicio que alimenta `/blog.html`. La página sigue siendo estática (HTML5, CSS y JavaScript); el Worker resuelve las solicitudes RSS de servidor, evita las restricciones CORS de los editores y almacena un conjunto unificado de noticias en Cloudflare KV.

## Arquitectura

1. Un Cron Trigger ejecuta el Worker cada 15 minutos.
2. El Worker consulta las fuentes RSS/Atom permitidas en `src/index.js` en paralelo.
3. Normaliza los artículos, clasifica cada noticia en IA, tecnología, ciberseguridad o cloud y elimina duplicados.
4. Guarda el resultado en el namespace KV `NEWS_CACHE`.
5. La página consulta `https://abundia.io/api/news` (misma procedencia; no requiere CORS).
6. La pestaña abierta vuelve a consultar el endpoint cada cinco minutos; el botón «Actualizar» solicita una actualización inmediata. El Worker usa un bloqueo KV de 90 segundos para evitar que cada visitante dispare una descarga completa de todos los feeds.

No se almacenan ni se republican artículos completos. La página presenta titulares, fragmentos descriptivos, fuente y fecha, y enlaza a la publicación original. La selección incluye fuentes en inglés y en español; se conserva el idioma que publica cada editor, no se hace traducción automática.

## Requisitos

- Una cuenta de Cloudflare con el dominio `abundia.io` activo en la misma cuenta/zona donde se desplegará el Worker.
- Node.js LTS y Wrangler CLI.
- Permisos para Workers, KV y DNS/Routes en Cloudflare.

## Despliegue inicial

Desde esta carpeta (`workers/news-aggregator`):

```bash
npm install
npx wrangler login
npx wrangler kv namespace create NEWS_CACHE
```

Copiá el `id` que devuelve el último comando y reemplazá en `wrangler.toml` el valor `REEMPLAZAR_CON_KV_NAMESPACE_ID`.

Luego desplegá:

```bash
npx wrangler deploy
```

Wrangler crea el Cron Trigger de 15 minutos a partir de `wrangler.toml`. El route definido intercepta solamente `abundia.io/api/news`; el resto de la web continúa siendo servido por Cloudflare Pages.

## Primera actualización y comprobación

La primera llamada al endpoint sin caché intenta poblar KV automáticamente. También podés forzar una actualización manual:

```bash
curl "https://abundia.io/api/news?refresh=1"
```

La respuesta JSON incluye `updatedAt`, `items`, `feeds` y `stats`. Si alguna fuente falla temporalmente, se conserva el resultado de las otras y la incidencia queda indicada en `feeds`.

Para comprobar la configuración del cron:

1. Cloudflare Dashboard → Workers & Pages → `abundia-news-aggregator`.
2. Settings → Triggers → Cron Triggers.
3. Confirmar `*/15 * * * *`.
4. Revisar Logs si alguna fuente comienza a fallar.

## Mantener las fuentes RSS

La lista estática `FEEDS` se encuentra al inicio de `src/index.js`. Cada objeto usa:

```js
{ name: 'Nombre visible', url: 'https://editor.example/feed.xml', category: 'ai' }
```

`category` puede ser `ai`, `technology`, `security` o `cloud`. La clasificación automática puede cambiar la categoría según el contenido. Añadí únicamente feeds HTTPS de editores conocidos y revisá su funcionamiento antes de incorporarlos.

## Parámetros operativos

- Frecuencia de lectura de feeds: cada 15 minutos.
- Reconsulta del endpoint desde pestañas abiertas: cada 5 minutos (solo mientras la pestaña está visible).
- Fuentes iniciales: OpenAI, Google DeepMind, Hugging Face, TechCrunch AI, The Verge AI, Ars Technica AI, WIRED AI, MIT Technology Review AI, AWS AI, Cloudflare Blog y Xataka.
- Botón de actualización: actualización inmediata, con bloqueo global de 90 segundos.
- Retención de artículos: hasta 45 días, con un máximo de 84 titulares.
- Timeout por fuente: 10 segundos.
- Tamaño máximo leído por feed: 2 MB.
- Dependencias de runtime: ninguna; el Worker usa APIs nativas de Cloudflare Workers.

## Nota sobre Cloudflare Pages

Este proyecto ya contiene un sitio estático. No necesitás migrarlo a Workers ni cambiar el proceso de publicación en Pages. El Worker se despliega por separado y el route `/api/news` atiende solamente el endpoint JSON. La política CSP existente ya permite `connect-src 'self'`, por lo que la página consume el endpoint desde el mismo dominio.
