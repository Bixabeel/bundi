/* ============================================
   ABUNDIA.IO - Footer Component Injector
   Extends the minimal legal-page footer with the
   full set of columns used across the classic site
   (services, ImmuniWeb, contact), keeping the existing
   "Legal" column exactly as authored on the page.
   ============================================ */

(function () {
  'use strict';

  var footer = document.getElementById('site-footer');
  if (!footer) return;

  // The page already authors its own "Legal" column as a
  // <div class="footer-column">…</div> directly inside #site-footer.
  // Keep that node exactly as-is; just relocate it into the full grid.
  var legalColumn = footer.querySelector('.footer-column');
  var legalColumnHTML = legalColumn ? legalColumn.outerHTML : '';

  var brandHTML = ''
    + '<div class="footer-brand">'
    + '  <a href="/" class="footer-logo" aria-label="Abundia.io - Inicio">'
    + '    <img src="/assets/img/logo.webp" alt="Abundia.io" class="footer-logo-icon" width="40" height="40">'
    + '    <span class="footer-logo-name">Abundia.io</span>'
    + '  </a>'
    + '  <p class="footer-description">Ecosistema tecnológico enfocado en ciberseguridad, IA, hosting, automatización y desarrollo web premium</p>'
    + '</div>';

  var servicesHTML = ''
    + '<div class="footer-column">'
    + '  <h4 class="footer-title">Servicios</h4>'
    + '  <ul class="footer-links">'
    + '    <li><a href="/servicios/ciberseguridad.html">Ciberseguridad</a></li>'
    + '    <li><a href="/servicios/hosting.html">Hosting</a></li>'
    + '    <li><a href="/servicios/desarrollo-web.html">Desarrollo Web</a></li>'
    + '    <li><a href="/servicios/ia.html">IA &amp; Automatización</a></li>'
    + '  </ul>'
    + '</div>';

  var contactHTML = ''
    + '<div class="footer-column">'
    + '  <h4 class="footer-title">Contacto</h4>'
    + '  <ul class="footer-contact">'
    + '    <li><a href="mailto:info@abundia.io">info@abundia.io</a></li>'
    + '    <li>San José, Costa Rica</li>'
    + '  </ul>'
    + '</div>';

  footer.className = 'footer';
  footer.innerHTML = ''
    + '<div class="container">'
    + '  <div class="footer-grid">'
    + brandHTML
    + servicesHTML
    + contactHTML
    + legalColumnHTML
    + '  </div>'
    + '  <div class="footer-bottom">'
    + '    <p>&copy; 2023-2026 Abundia.io · Todos los derechos reservados</p>'
    + '    <p class="footer-partner">Partner ImmuniWeb® · Hosting · IA · Seguridad</p>'
    + '  </div>'
    + '</div>';
})();
