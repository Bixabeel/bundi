import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { parseFeed, classify, cleanSummary } from '../src/index.js';

const feed = { name: 'OpenAI News', category: 'ai' };

test('parses RSS 2.0 entries, CDATA, entities and dates', () => {
  const xml = `<?xml version="1.0"?><rss><channel><item>
    <title><![CDATA[New AI model &amp; tools]]></title>
    <link>https://example.com/story?ref=rss</link>
    <description><![CDATA[<p>Research &amp; <strong>new capabilities</strong>.</p>]]></description>
    <pubDate>Tue, 17 Nov 2026 10:30:00 GMT</pubDate>
  </item></channel></rss>`;
  const [item] = parseFeed(xml, feed);
  assert.equal(item.title, 'New AI model & tools');
  assert.equal(item.url, 'https://example.com/story?ref=rss');
  assert.equal(item.summary, 'Research & new capabilities.');
  assert.equal(item.category, 'ai');
  assert.equal(item.date, '2026-11-17T10:30:00.000Z');
});

test('parses Atom entries and prefers the alternate href', () => {
  const xml = `<feed xmlns="http://www.w3.org/2005/Atom"><entry>
    <title>Cloud platform update</title>
    <link rel="self" href="https://example.com/feed.xml" />
    <link rel="alternate" type="text/html" href="https://example.com/cloud-update" />
    <summary>New infrastructure and edge computing changes.</summary>
    <updated>2026-11-18T09:00:00Z</updated>
  </entry></feed>`;
  const [item] = parseFeed(xml, { name: 'Tech Source', category: 'technology' });
  assert.equal(item.url, 'https://example.com/cloud-update');
  assert.equal(item.category, 'cloud');
  assert.equal(item.date, '2026-11-18T09:00:00.000Z');
});

test('rejects insecure and malformed article links', () => {
  const xml = `<rss><channel>
    <item><title>Insecure item</title><link>http://example.com/a</link></item>
    <item><title>Valid item</title><link>https://example.com/b</link></item>
    <item><title>Missing link</title></item>
  </channel></rss>`;
  const items = parseFeed(xml, feed);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Valid item');
});

test('classifies security and cloud signals ahead of the default topic', () => {
  assert.equal(classify('Critical ransomware vulnerability and WAF update', 'technology'), 'security');
  assert.equal(classify('Kubernetes serverless edge computing', 'technology'), 'cloud');
  assert.equal(cleanSummary('<p>Hello <b>World</b></p>'), 'Hello World');
});


test('serves a normalized payload through the same-origin API and persists it in KV', async () => {
  const store = new Map();
  const kv = {
    async get(key, type) {
      const value = store.get(key);
      if (value === undefined) return null;
      return type === 'json' ? JSON.parse(value) : value;
    },
    async put(key, value) { store.set(key, value); }
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    `<rss><channel><item><title>Example AI release</title><link>https://publisher.example/story</link><description>New research release.</description><pubDate>Wed, 18 Nov 2026 10:00:00 GMT</pubDate></item></channel></rss>`,
    { status: 200, headers: { 'content-type': 'application/rss+xml' } }
  );

  try {
    const response = await worker.fetch(
      new Request('https://abundia.io/api/news?refresh=1'),
      { NEWS_CACHE: kv }
    );
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/json/);
    const payload = await response.json();
    assert.equal(payload.items.length, 1, 'duplicate links across feeds are collapsed');
    assert.equal(payload.stats.totalFeeds, 11);
    assert.equal(payload.stats.successfulFeeds, 11);
    assert.ok(store.has('news:latest:v1'));
    assert.ok(store.has('news:refresh-lock:v1'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
