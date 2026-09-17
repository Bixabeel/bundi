/* ============================================
   ABUNDIA.IO - Header Component Injector
   Injects the site-standard navbar (identical markup
   to the classic pages) into <header id="site-header">.
   Used by the legal/ subsystem so navigation stays
   in sync with the rest of the site from one source.
   ============================================ */

(function () {
  'use strict';

  var header = document.getElementById('site-header');
  if (!header) return;

  var markup = ''
    + '<nav class="navbar-container" role="navigation" aria-label="Navegación principal">'
    + '  <a href="/" class="navbar-logo" aria-label="Abundia.io - Inicio">'
    + '    <img src="/assets/img/logo.webp" alt="Abundia.io" class="navbar-logo-icon" width="40" height="40">'
    + '    <div class="navbar-logo-text">'
    + '      <span class="navbar-logo-tagline">ECOSISTEMA TECNOLÓGICO</span>'
    + '      <span class="navbar-logo-name">ABUNDIA.IO</span>'
    + '    </div>'
    + '  </a>'
    + '  <ul class="navbar-menu" id="navbar-menu">'
    + '    <li class="navbar-item"><a href="/#servicios" class="navbar-link">Servicios</a></li>'
    + '    <li class="navbar-item"><a href="/proyectos.html" class="navbar-link">Abundia Labs</a></li>'
    + '    <li class="navbar-item"><a href="/servicios/hosting.html" class="navbar-link">Hosting</a></li>'
    + '    <li class="navbar-item"><a href="/servicios/hosting.html#planes" class="navbar-link">Planes</a></li>'
    + '    <li class="navbar-item"><a href="/contacto.html" class="navbar-link">Contacto</a></li>'
    + '    <li class="navbar-item"><a href="/legal/" class="navbar-link">Legal</a></li>'
    + '  </ul>'
    + '  <div class="navbar-actions">'
    + '    <a href="/contacto.html" class="btn btn-primary navbar-cta">'
    + '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    + '      Solicitar Cotización'
    + '    </a>'
    + '    <button class="navbar-toggle" id="navbar-toggle" aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="navbar-menu">'
    + '      <span class="navbar-toggle-line"></span>'
    + '      <span class="navbar-toggle-line"></span>'
    + '      <span class="navbar-toggle-line"></span>'
    + '    </button>'
    + '  </div>'
    + '</nav>'
    + '<div class="navbar-mobile-menu" id="navbar-mobile-menu" aria-hidden="true">'
    + '  <ul class="navbar-mobile-list">'
    + '    <li><a href="/#servicios" class="navbar-mobile-link">Servicios</a></li>'
    + '    <li><a href="/proyectos.html" class="navbar-mobile-link">Abundia Labs</a></li>'
    + '    <li><a href="/servicios/hosting.html" class="navbar-mobile-link">Hosting</a></li>'
    + '    <li><a href="/servicios/hosting.html#planes" class="navbar-mobile-link">Planes</a></li>'
    + '    <li><a href="/legal/" class="navbar-mobile-link">Legal</a></li>'
    + '    <li><a href="/contacto.html" class="navbar-mobile-cta">Solicitar cotización</a></li>'
    + '  </ul>'
    + '</div>';

  header.className = 'navbar';
  header.id = 'navbar';
  header.setAttribute('role', 'banner');
  header.innerHTML = markup;

  // Re-dispatch so navbar.js (loaded after this component) can bind
  // scroll/toggle behavior against the freshly injected elements.
  document.dispatchEvent(new CustomEvent('abundia:header-ready'));
})();
