/*
 * Abundia.io — RSS News Aggregator
 * Cloudflare Worker: cron refresh + KV storage + same-origin JSON API.
 * Feed URLs are a static allowlist; no user-controlled URL is fetched.
 */

const CACHE_KEY = 'news:latest:v1';
const LOCK_KEY = 'news:refresh-lock:v1';
const MAX_ITEMS = 84;
const MAX_AGE_DAYS = 45;
const MAX_FEED_BYTES = 2_000_000;
const FETCH_TIMEOUT_MS = 10_000;

const FEEDS = [
  { name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', category: 'ai' },
  { name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', category: 'ai' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', category: 'ai' },
  { name: 'TechCrunch · IA', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'ai' },
  { name: 'The Verge · IA', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'ai' },
  { name: 'Ars Technica · IA', url: 'https://arstechnica.com/ai/feed/', category: 'ai' },
  { name: 'WIRED · IA', url: 'https://www.wired.com/feed/tag/ai/latest/rss', category: 'ai' },
  { name: 'MIT Technology Review · IA', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', category: 'ai' },
  { name: 'AWS AI', url: 'https://aws.amazon.com/blogs/ai/feed/', category: 'ai' },
  { name: 'Cloudflare Blog', url: 'https://blog.cloudflare.com/rss/', category: 'technology' },
  { name: 'Xataka', url: 'https://www.xataka.com/feedburner.xml', category: 'technology' }
];

function decodeEntities(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Math.min(Number(n), 0x10ffff)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Math.min(parseInt(n, 16), 0x10ffff)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readTag(xml, names) {
  for (const name of names) {
    let openName;
    let closeName;
    if (name.includes(':')) {
      const parts = name.split(':');
      openName = escapeRegex(parts[0]) + ':' + escapeRegex(parts[1]);
      closeName = openName;
    } else {
      openName = '(?:[\\w.-]+:)?' + escapeRegex(name);
      closeName = openName;
    }
    const match = xml.match(new RegExp('<' + openName + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + closeName + '\\s*>', 'i'));
    if (match) return decodeEntities(match[1].trim());
  }
  return '';
}

function readAtomLink(block) {
  const links = [...block.matchAll(/<(?:[\w.-]+:)?link\b([^>]*)\/?\s*>/gi)];
  for (const match of links) {
    const attrs = match[1] || '';
    const rel = (attrs.match(/\brel=["']([^"']+)["']/i) || [])[1] || 'alternate';
    const href = (attrs.match(/\bhref=["']([^"']+)["']/i) || [])[1];
    if (href && rel !== 'self' && rel !== 'enclosure') return decodeEntities(href);
  }
  return readTag(block, ['link']);
}

function cleanSummary(value) {
  return decodeEntities(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim()
    .slice(0, 360);
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(decodeEntities(value).trim());
    if (url.protocol !== 'https:') return null;
    url.hash = '';
    return url.href;
  } catch (_) {
    return null;
  }
}

function classify(text, fallback) {
  const value = text.toLocaleLowerCase('en');
  if (/cyber.?security|ransomware|phishing|malware|vulnerabilit|zero.?day|breach|threat actor|waf|ddos|cve-|exploit|infosec/.test(value)) return 'security';
  if (/cloudflare|cloud computing|cloud platform|kubernetes|serverless|data center|datacenter|aws |azure|google cloud|infrastructure|edge computing/.test(value)) return 'cloud';
  if (/artificial intelligence|\bai\b|\bllm\b|machine learning|deep learning|neural|generative|agentic|multimodal|language model|openai|deepmind|hugging face|gemini|chatgpt|copilot/.test(value)) return 'ai';
  return fallback || 'technology';
}

function categoryLabel(category) {
  return ({ ai: 'Inteligencia artificial', technology: 'Tecnología', security: 'Ciberseguridad', cloud: 'Cloud' })[category] || 'Tecnología';
}

function parseFeed(xml, feed) {
  const blocks = [];
  const itemRegex = /<(?:[\w.-]+:)?item\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?item\s*>/gi;
  const entryRegex = /<(?:[\w.-]+:)?entry\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?entry\s*>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) blocks.push(match[1]);
  if (!blocks.length) while ((match = entryRegex.exec(xml)) !== null) blocks.push(match[1]);

  return blocks.map(block => {
    const title = cleanSummary(readTag(block, ['title'])).slice(0, 240);
    const link = safeHttpsUrl(readAtomLink(block));
    const summaryRaw = readTag(block, ['description', 'summary', 'content:encoded', 'content']);
    const summary = cleanSummary(summaryRaw);
    const rawDate = readTag(block, ['pubDate', 'published', 'updated', 'dc:date', 'date']);
    const parsedDate = rawDate ? new Date(rawDate) : null;
    const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null;
    if (!title || !link) return null;

    const category = classify(title + ' ' + summary, feed.category);
    return {
      id: link,
      title,
      url: link,
      summary,
      source: feed.name,
      category,
      categoryLabel: categoryLabel(category),
      date
    };
  }).filter(Boolean);
}

async function fetchFeed(feed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(feed.url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'Accept': 'application/atom+xml, application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'User-Agent': 'AbundiaNewsAggregator/1.0 (+https://abundia.io/blog.html)'
      }
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_FEED_BYTES) throw new Error('Feed demasiado grande');
    const xml = await response.text();
    if (new TextEncoder().encode(xml).byteLength > MAX_FEED_BYTES) throw new Error('Feed demasiado grande');
    const items = parseFeed(xml, feed);
    if (!items.length) throw new Error('No se encontraron entradas válidas');
    return { items, status: { name: feed.name, ok: true, count: items.length } };
  } catch (error) {
    return { items: [], status: { name: feed.name, ok: false, count: 0, error: String(error && error.message || 'Error de lectura').slice(0, 90) } };
  } finally {
    clearTimeout(timer);
  }
}

async function refreshAll(env) {
  const results = await Promise.all(FEEDS.map(feed => fetchFeed(feed)));
  const byUrl = new Map();
  const now = Date.now();
  const minDate = now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  for (const result of results) {
    for (const item of result.items) {
      if (item.date && new Date(item.date).getTime() < minDate) continue;
      const existing = byUrl.get(item.url);
      if (!existing || (item.date && (!existing.date || item.date > existing.date))) byUrl.set(item.url, item);
    }
  }

  const items = [...byUrl.values()].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;
    return bTime - aTime;
  }).slice(0, MAX_ITEMS);

  const successfulFeeds = results.filter(result => result.status.ok).length;
  const payload = {
    updatedAt: new Date().toISOString(),
    items,
    feeds: results.map(result => result.status),
    stats: { total: items.length, successfulFeeds, totalFeeds: FEEDS.length }
  };

  if (env.NEWS_CACHE) {
    await env.NEWS_CACHE.put(CACHE_KEY, JSON.stringify(payload), { expirationTtl: 60 * 60 * 48 });
  }
  return payload;
}

function jsonResponse(payload, status, cacheControl) {
  return new Response(JSON.stringify(payload), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl || 'public, max-age=120, s-maxage=120',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Vary': 'Accept'
    }
  });
}

async function readCache(env) {
  if (!env.NEWS_CACHE) return null;
  const value = await env.NEWS_CACHE.get(CACHE_KEY, 'json');
  return value && Array.isArray(value.items) ? value : null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/news') return new Response('Not found', { status: 404 });
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return jsonResponse({ error: 'Method not allowed' }, 405, 'no-store');
    }
    if (!env.NEWS_CACHE) {
      return jsonResponse({ error: 'Falta configurar el binding NEWS_CACHE en Cloudflare KV.' }, 503, 'no-store');
    }

    let payload = await readCache(env);
    const wantsRefresh = url.searchParams.get('refresh') === '1';

    if (!payload || wantsRefresh) {
      const lockExists = await env.NEWS_CACHE.get(LOCK_KEY);
      if (!lockExists) {
        await env.NEWS_CACHE.put(LOCK_KEY, '1', { expirationTtl: 90 });
        try {
          payload = await refreshAll(env);
        } catch (error) {
          if (!payload) return jsonResponse({ error: 'No se pudo actualizar el agregador RSS.' }, 502, 'no-store');
        }
      } else if (!payload) {
        return jsonResponse({ error: 'La primera actualización está en curso. Volvé a intentar en unos segundos.' }, 503, 'no-store');
      }
    }

    if (!payload) return jsonResponse({ error: 'Todavía no hay noticias disponibles.' }, 503, 'no-store');
    return jsonResponse(payload, 200, wantsRefresh ? 'no-store' : 'public, max-age=120, s-maxage=120');
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(refreshAll(env));
  }
};


// Exported for lightweight Node.js parser tests; these helpers have no runtime dependencies.
export { parseFeed, cleanSummary, classify };
