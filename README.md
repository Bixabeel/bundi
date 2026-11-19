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
- [Radar tecnológico (RSS)](#radar-tecnológico-rss)
- [Seguridad](#seguridad)
- [Accesibilidad](#accesibilidad)
- [SEO](#seo)
- [TODOs Pendientes](#todos-pendientes)

---

## 🏗️ Arquitectura del Proyecto

Abundia.io es un sitio web multipágina construido principalmente como sitio estático con HTML5, CSS3 y JavaScript vanilla (ES6+). No utiliza frameworks SPA (React, Vue, Angular) ni requiere proceso de compilación (build step). Las páginas existentes y el nuevo Blog se publican en Cloudflare Pages; el agregador RSS del Blog funciona como un Cloudflare Worker independiente conectado a Cloudflare KV.

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
├── blog.html                     # Radar tecnológico alimentado por RSS/Atom
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
│   ├── animations.css            # Scroll-reveal (.reveal*)
│   └── blog.css                  # UI responsive del Radar tecnológico
│
├── js/
│   ├── main.js                   # Inicialización, no-js removal
│   ├── navbar.js                 # Toggle móvil, scroll behavior
│   ├── scroll.js
│   ├── cursor.js
│   ├── animations.js             # IntersectionObserver para .reveal*
│   └── blog.js                   # Búsqueda, filtros, paginación y endpoint RSS
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
├── workers/
│   └── news-aggregator/          # Cloudflare Worker + KV + Cron para RSS/Atom
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
- Hosting: Cloudflare Pages para el sitio estático
- RSS/Atom: Cloudflare Workers + KV + Cron Trigger (cada 15 minutos)

---

## 🔒 Seguridad

El proyecto sigue una política de hardening que incluye Content-Security-Policy y cabeceras HTTP restrictivas gestionadas vía Cloudflare (`_headers`). El Worker del agregador solo consulta una lista fija de feeds HTTPS; los titulares y resúmenes externos se insertan en el DOM como texto y los enlaces se validan para aceptar únicamente HTTPS.

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



## Radar tecnológico (RSS)

La página pública `blog.html` presenta noticias de IA, tecnología, ciberseguridad y cloud. El navegador consulta un endpoint del mismo dominio (`/api/news`); las fuentes RSS/Atom se consultan desde un Cloudflare Worker independiente, que normaliza los titulares y mantiene el resultado en Cloudflare KV con una actualización programada cada 15 minutos.

El código del agregador, el archivo `wrangler.toml`, el procedimiento de despliegue y las pruebas del parser están en `workers/news-aggregator/`. Antes de publicar, ejecutá `npm install`, configurá el ID del namespace KV en `wrangler.toml`, probá con `npm test` y desplegá con `npx wrangler deploy` desde esa carpeta. El despliegue de la web estática en Cloudflare Pages no cambia.
