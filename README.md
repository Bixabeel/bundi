# Abundia.io - Enterprise Digital Product

**Ecosistema tecnológico enfocado en ciberseguridad, IA, hosting, automatización y desarrollo web premium.**

---

## 📋 Tabla de Contenidos

- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Estructura de Archivos](#estructura-de-archivos)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Diseño y UX/UI](#diseño-y-uxui)
- [Páginas del Sitio](#páginas-del-sitio)
- [Características Técnicas](#características-técnicas)
- [Despliegue](#despliegue)
- [Seguridad](#seguridad)
- [Accesibilidad](#accesibilidad)
- [SEO](#seo)
- [TODOs Pendientes](#todos-pendientes)

---

## 🏗️ Arquitectura del Proyecto

Abundia.io es un sitio web estático multipágina construido con HTML5, CSS3 y JavaScript vanilla (ES6+). No utiliza frameworks SPA (React, Vue, Angular) ni requiere proceso de compilación (build step). El sitio puede desplegarse directamente en GitHub Pages, Cloudflare Pages o cualquier servidor estático.

### Principios Arquitectónicos

- **Modularidad**: CSS y JavaScript separados en archivos específicos por funcionalidad
- **Reutilización**: Componentes CSS y JS reutilizables entre páginas
- **Performance**: Sin dependencias externas innecesarias, código minificado
- **Accesibilidad**: WCAG 2.1 AA, ARIA labels, navegación por teclado
- **SEO Ready**: Meta tags, Open Graph, Schema.org, sitemap.xml
- **Responsive**: Mobile-first con breakpoints en 640px, 768px, 1024px, 1280px, 1536px

---

## 📁 Estructura de Archivos

```
Abundia New/
├── index.html                    # Home
├── about.html
├── contacto.html
├── gracias.html
├── proyectos.html
├── servicios.html
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── favicon.ico / favicon.svg / favicon-96x96.png
├── apple-touch-icon.png
├── web-app-manifest-{192,512}x192.png
│
├── css/
│   ├── main.css                  # Variables, reset, layout, utilidades
│   ├── navbar.css
│   ├── hero.css
│   ├── sections.css
│   ├── footer.css
│   ├── responsive.css
│   └── animations.css            # Scroll-reveal (.reveal*)
│
├── js/
│   ├── main.js                   # Inicialización, no-js removal
│   ├── navbar.js                 # Toggle móvil, scroll behavior
│   ├── scroll.js
│   ├── cursor.js
│   ├── animations.js             # IntersectionObserver para .reveal*
│
│
├── assets/
│   ├── img/                      # Imágenes .webp + logo.png
│   │   └── og/og-image.jpg       # Imagen Open Graph compartida
│   ├── css/                      # Estilos propios del subsistema legal/
│   │   ├── main.css
│   │   └── components.css
│   └── js/components/            # Inyección de navbar/footer en legal/
│       ├── header.js
│       └── footer.js
│
├── proyectos/                    # 6 páginas de portafolio
├── servicios/                    # 12 páginas de servicios
├── legal/                        # Centro legal (privacidad, términos, cookies, etc.)
│
└── tools/                        # Scripts de desarrollo (no se despliegan como parte del sitio público)
    └── Rebuild-LegalPages.ps1
```

---

## 🛠️ Tecnologías Utilizadas

- HTML5 semántico
- CSS3 (variables custom, Grid, Flexbox, sin frameworks)
- JavaScript vanilla ES6+ (sin dependencias de runtime)
- Google Fonts (Inter, JetBrains Mono)
- Phosphor Icons vía CDN (solo en `legal/`)
- Hosting: sitio estático detrás de Cloudflare

---

## 🔒 Seguridad

El proyecto sigue una política de hardening que incluye Content-Security-Policy, cabeceras HTTP restrictivas gestionadas vía Cloudflare (`_headers`), y ausencia de dependencias de backend propio. Ver la documentación de despliegue de Cloudflare del proyecto para el detalle completo de configuración.

---

## ♿ Accesibilidad

Objetivo WCAG 2.2 AA: atributos `alt` en el 100% de las imágenes, jerarquía de encabezados, navegación por teclado, `prefers-reduced-motion` respetado, y skip-link disponible en el subsistema legal.

---

## 🔍 SEO

Cada página incluye `canonical`, Open Graph y meta description. El `sitemap.xml` cubre todas las páginas indexables; las páginas del centro legal usan `noindex` para evitar contenido de bajo valor en los resultados de búsqueda.

---

## 📝 TODOs Pendientes

- Evaluar consolidar `servicios/ia.html` y `servicios/inteligencia-artificial.html` (contenido temáticamente solapado)
- Completar `og:image:width` / `og:image:height` y `twitter:image` en todas las páginas

