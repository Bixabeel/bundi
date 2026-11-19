/* ==========================================================
   ABUNDIA.IO — Radar tecnológico / RSS client
   Consume el endpoint same-origin /api/news del Cloudflare Worker.
   Renderizado seguro: todo el contenido remoto se inserta vía
   textContent y atributos DOM, nunca mediante innerHTML.
   ========================================================== */
(function () {
  'use strict';

  const API_URL = '/api/news';
  const PAGE_SIZE = 9;
  const CATEGORY_LABELS = {
    ai: 'Inteligencia artificial',
    technology: 'Tecnología',
    security: 'Ciberseguridad',
    cloud: 'Cloud'
  };

  const elements = {
    status: document.getElementById('blog-feed-status'),
    statusText: document.getElementById('blog-status-text'),
    resultsCount: document.getElementById('blog-results-count'),
    updatedAt: document.getElementById('blog-updated-at'),
    sourceCount: document.getElementById('blog-source-count'),
    featuredWrap: document.getElementById('blog-featured-wrap'),
    featured: document.getElementById('blog-featured'),
    results: document.getElementById('blog-results'),
    empty: document.getElementById('blog-empty'),
    error: document.getElementById('blog-error'),
    loadMoreWrap: document.getElementById('blog-load-more-wrap'),
    loadMore: document.getElementById('blog-load-more'),
    refresh: document.getElementById('blog-refresh'),
    search: document.getElementById('blog-search-input'),
    reset: document.getElementById('blog-reset'),
    retry: document.getElementById('blog-retry')
  };

  const state = {
    items: [],
    feeds: [],
    updatedAt: null,
    category: 'all',
    query: '',
    visible: PAGE_SIZE,
    loading: false,
    hasLoaded: false
  };

  function makeElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function safeArticleUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : null;
    } catch (_) {
      return null;
    }
  }

  function formatDate(value) {
    if (!value) return 'Fecha no disponible';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
    return new Intl.DateTimeFormat('es-CR', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(date);
  }

  function formatDateTime(value) {
    if (!value) return 'sin registro';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'sin registro';
    return new Intl.DateTimeFormat('es-CR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  }

  function setStatus(message, type) {
    elements.statusText.textContent = message;
    elements.status.classList.remove('is-online', 'is-warning', 'is-error');
    if (type) elements.status.classList.add(type);
  }

  function setLoading(isLoading) {
    state.loading = isLoading;
    elements.refresh.disabled = isLoading;
    elements.refresh.classList.toggle('is-loading', isLoading);
    elements.refresh.setAttribute('aria-busy', String(isLoading));
  }

  async function loadNews(manualRefresh) {
    if (state.loading) return;
    setLoading(true);
    elements.error.hidden = true;
    if (!state.hasLoaded) {
      elements.results.setAttribute('aria-busy', 'true');
      setStatus('Conectando con las fuentes…', '');
    } else if (manualRefresh) {
      setStatus('Consultando las fuentes…', '');
    }

    try {
      const url = manualRefresh ? API_URL + '?refresh=1' : API_URL;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: manualRefresh ? 'no-store' : 'default',
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const payload = await response.json();
      if (!payload || !Array.isArray(payload.items)) throw new Error('Respuesta RSS inválida');

      state.items = payload.items.filter(item => item && item.title && safeArticleUrl(item.url));
      state.feeds = Array.isArray(payload.feeds) ? payload.feeds : [];
      state.updatedAt = payload.updatedAt || null;
      state.hasLoaded = true;
      state.visible = PAGE_SIZE;
      elements.sourceCount.textContent = String(state.feeds.length || '—');
      elements.updatedAt.textContent = 'Última actualización: ' + formatDateTime(state.updatedAt);

      const failedFeeds = state.feeds.filter(feed => feed && feed.ok === false).length;
      if (failedFeeds > 0) {
        setStatus(state.items.length + ' noticias · ' + failedFeeds + ' fuentes con incidencias', 'is-warning');
      } else {
        setStatus(state.items.length + ' noticias disponibles', 'is-online');
      }
      render();
    } catch (error) {
      console.error('[Abundia Radar] No se pudo cargar el feed:', error);
      if (state.hasLoaded && state.items.length) {
        setStatus('Mostrando la última actualización disponible', 'is-warning');
      } else {
        elements.results.replaceChildren();
        elements.error.hidden = false;
        elements.resultsCount.textContent = 'No hay datos disponibles';
        setStatus('Servicio temporalmente no disponible', 'is-error');
      }
    } finally {
      setLoading(false);
      elements.results.setAttribute('aria-busy', 'false');
    }
  }

  function makeMeta(item) {
    const meta = makeElement('div', 'blog-card-meta');
    const category = makeElement('span', 'blog-category', item.categoryLabel || CATEGORY_LABELS[item.category] || 'Tecnología');
    const date = makeElement('time', '', formatDate(item.date));
    if (item.date) date.dateTime = item.date;
    meta.append(category, date);
    return meta;
  }

  function makeArticleLink(item, className, text) {
    const href = safeArticleUrl(item.url);
    if (!href) return makeElement('span', className, text);
    const link = makeElement('a', className, text);
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.referrerPolicy = 'strict-origin-when-cross-origin';
    return link;
  }

  function renderFeatured(item) {
    elements.featured.replaceChildren();
    if (!item) {
      elements.featuredWrap.hidden = true;
      return;
    }

    const card = makeElement('article', 'blog-featured-card');
    const main = makeElement('div', 'blog-featured-main');
    const top = makeMeta(item);
    const title = makeElement('h3');
    title.appendChild(makeArticleLink(item, '', item.title));
    const summary = makeElement('p', 'blog-featured-summary', item.summary || 'Abrí la publicación original para consultar todos los detalles.');
    const mainContent = makeElement('div');
    mainContent.append(top, title, summary);
    main.appendChild(mainContent);

    const side = makeElement('div', 'blog-featured-side');
    side.appendChild(makeElement('span', 'blog-featured-side-label', 'PUBLICADO POR'));
    side.appendChild(makeElement('strong', 'blog-featured-source', item.source || 'Fuente externa'));
    side.appendChild(makeElement('span', 'blog-featured-number', '01'));
    side.appendChild(makeArticleLink(item, 'blog-featured-arrow', 'Leer publicación original →'));
    card.append(main, side);
    elements.featured.appendChild(card);
    elements.featuredWrap.hidden = false;
  }

  function renderCard(item) {
    const card = makeElement('article', 'blog-card');
    card.appendChild(makeMeta(item));

    const title = makeElement('h3');
    title.appendChild(makeArticleLink(item, '', item.title));
    card.appendChild(title);

    if (item.summary) card.appendChild(makeElement('p', 'blog-card-summary', item.summary));

    const footer = makeElement('div', 'blog-card-footer');
    footer.appendChild(makeElement('span', 'blog-card-source', item.source || 'Fuente externa'));
    footer.appendChild(makeArticleLink(item, 'blog-card-read', 'Leer más ↗'));
    card.appendChild(footer);
    return card;
  }

  function filteredItems() {
    const query = state.query.trim().toLocaleLowerCase('es');
    return state.items.filter(item => {
      const matchesCategory = state.category === 'all' || item.category === state.category;
      if (!matchesCategory) return false;
      if (!query) return true;
      const searchable = [item.title, item.summary, item.source, item.categoryLabel].join(' ').toLocaleLowerCase('es');
      return searchable.includes(query);
    });
  }

  function render() {
    const matching = filteredItems();
    const hasFeature = state.category === 'all' && !state.query.trim() && matching.length > 0;
    const featuredItem = hasFeature ? matching[0] : null;
    const listItems = featuredItem ? matching.slice(1) : matching;
    const visibleItems = listItems.slice(0, state.visible);

    renderFeatured(featuredItem);
    elements.results.replaceChildren();
    visibleItems.forEach(item => elements.results.appendChild(renderCard(item)));
    elements.resultsCount.textContent = matching.length + (matching.length === 1 ? ' noticia' : ' noticias');
    elements.empty.hidden = matching.length > 0;
    elements.loadMoreWrap.hidden = listItems.length <= state.visible;

    if (!matching.length) {
      elements.featuredWrap.hidden = true;
    }
  }

  function updateCategory(category) {
    state.category = category;
    state.visible = PAGE_SIZE;
    document.querySelectorAll('.blog-filter').forEach(button => {
      const active = button.dataset.category === category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    render();
  }

  document.querySelectorAll('.blog-filter').forEach(button => {
    button.addEventListener('click', () => updateCategory(button.dataset.category || 'all'));
  });

  elements.search.addEventListener('input', () => {
    state.query = elements.search.value || '';
    state.visible = PAGE_SIZE;
    render();
  });

  elements.loadMore.addEventListener('click', () => {
    state.visible += PAGE_SIZE;
    render();
  });

  elements.refresh.addEventListener('click', () => loadNews(true));
  elements.retry.addEventListener('click', () => loadNews(false));
  elements.reset.addEventListener('click', () => {
    elements.search.value = '';
    state.query = '';
    updateCategory('all');
  });

  loadNews(false);

  // La página abierta reconsulta el endpoint cada cinco minutos mientras está visible.
  // El Worker mantiene los feeds sincronizados en KV cada quince minutos.
  window.setInterval(() => {
    if (!document.hidden && state.hasLoaded && !state.loading) loadNews(false);
  }, 5 * 60 * 1000);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.hasLoaded && !state.loading) loadNews(false);
  });
})();
