# Changelog

Todas las versiones notables de este proyecto. Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

---

## [v0.8] — 2026-05-29 · Dual-mode: Scene Viewer (markerless) + MindAR (tabletop con marcador)

### Added
- **`tabletop.html`** — segunda página con stack **MindAR + Three.js** (image tracking con marcador físico). Hotspots, sheets y lead capture funcionan **EN AR** (no mueren al entrar al modo cámara, como pasaba con Scene Viewer/Quick Look).
- **`assets/marker.png`** — diseño branded para imprimir (carta @ 200 DPI, 103 KB). Logo Teckio + patrones geométricos asimétricos en navy/orange para máximo feature tracking. Esquinas tipo ArUco. URL al fondo.
- **`assets/marker-preview.png`** — versión web 600×776 para mostrar en la página pre-AR.
- **`assets/js/projects.js`** — refactor: datos compartidos entre `index.html` y `tabletop.html`. Una sola fuente de verdad para `PROJECTS`, `WA_NUMBER`, webhooks. Incluye `hotspotsMarkerless` y `hotspotsMarker` por proyecto (coords distintas según el modo).
- **`qr-tabletop.png`** — QR específico apuntando a `tabletop.html`.
- **3 nuevos eventos de analytics:** `ar_marker_found`, `ar_marker_lost`, y el `mode: 'tabletop'` en todos los eventos de tabletop.html para distinguir de los de markerless.

### Changed
- `index.html` ahora carga `projects.js` para los datos (en vez de inline). Sin cambios funcionales para el usuario final.
- Bump versión a v0.8.

### Pendiente del usuario (no automatizable en sandbox)
- **Compilar `marker.png` → `marker.mind`** usando https://hiukim.github.io/mind-ar-js-doc/tools/compile/ (subir PNG, descargar `.mind`, colocar en `assets/marker.mind`). MindAR no arranca sin este archivo.
- **Imprimir `marker.png`** tamaño carta o A4. Plastificar si será de uso frecuente.

### Known limitations (MindAR)
- **iOS Safari**: pide permiso explícito de cámara. Si el usuario lo niega, hay que ir a Settings → Safari para revocar.
- **Tracking jitter**: peor que Scene Viewer nativo en marker AR. Aceptable para tabletop, inestable a >50 cm de distancia.
- **Battery drain**: TensorFlow.js + WebGL continuo calienta el celular. Sesiones largas drenan batería más rápido.
- **Lighting sensitivity**: marker degrada en luz baja, reflejos, dobleces.

---

## [v0.7] — 2026-05-29 · Wow factor — Controls (Vista / Tour / Día-Noche / Medir)

### Added
- **Camera presets** — toolbar con botón "Vista" que abre menú con 4 ángulos predefinidos (Isométrica, Fachada, Lateral, Vista aérea). Transición animada nativa.
- **Tour automático** — secuencia cinemática de 6 vistas en ~14s (fachada → laterales → trasera → aérea → iso). Botón toggle Start/Stop. Pausa auto-rotate durante tour.
- **Toggle Día / Noche** — cambia `exposure` (1.05 ↔ 0.45) y `shadow-intensity` (0.95 ↔ 0.35) + overlay azul oscuro sobre el viewer en modo noche.
- **Modo medir** — toggle que entra a estado "crosshair". Tap 2 puntos sobre el modelo → calcula distancia con `positionAndNormalFromPoint()` API y la **multiplica ×50** para mostrar la medida REAL del edificio (compensa el escalado 0.02× del modelo). Markers dinámicos en cada punto. Reset / Cerrar.
- **4 nuevos eventos de analytics:** `view_preset_click`, `tour_start`, `tour_stop`, `lighting_toggle`, `measure_start`, `measure_complete` (con `distance_m`), `measure_cancel`.

### Changed
- Toolbar visualmente integrada bajo la stats bar — mismo grid de 4 columnas, mismo lenguaje visual.

---

## [v0.6] — 2026-05-29 · Multi-proyecto + Lead Capture + Analytics

### Added
- **Sistema multi-proyecto vía URL param `?p=key`** — un solo deploy sirve N proyectos. Objeto `PROJECTS` con catálogo, render dinámico del DOM.
- **Lead capture gate antes de AR** — modal con nombre + teléfono + presupuesto. POST fire-and-forget al `LEAD_WEBHOOK`. Flag en localStorage por 30 días.
- **Función `track(event, props)`** — analytics granular a 4 destinos en paralelo (console, dataLayer, Plausible, webhook).
- **12 eventos instrumentados:** `page_view`, `ar_intent`, `lead_form_*` (open/submit/skip/close), `ar_start`/`ar_end`/`ar_failed` (con `duration_s`), `hotspot_click`, `sheet_view`, `cta_whatsapp_*`.
- **3 constantes config** en `<script>`: `LEAD_WEBHOOK`, `ANALYTICS_WEBHOOK`, `WA_NUMBER`.
- Comentario placeholder para Plausible Analytics en `<head>`.

### Changed
- DOM ahora se hidrata dinámicamente desde el proyecto resuelto (título, copy, stats, modelo, units).
- WhatsApp CTAs incluyen nombre del proyecto activo en el mensaje pre-llenado.

---

## [v0.5] — 2026-05-29 · Escala maqueta + UX hotspots

### Added
- Listener `ar-status` que oculta hotspots cuando AR está activo (`session-started` / `object-placed`).
- Texto de instrucciones reescrito explicando claramente que hotspots son solo en página web.

### Changed
- **Modelo escalado 0.02× via wrapper node** — bbox 37m → 75cm. Fuerza a Scene Viewer a "object-scale mode" para permitir reubicación manual con 1 dedo, rotación con 2 dedos, scale con pinch.
- `camera-orbit` ajustado a la nueva escala: distancia `60m → 1.5m`, min/max `15-200m → 0.4-5m`.
- Hotspot positions reescaladas (`15 8.5 7 → 0.30 0.17 0.14`, etc).
- `.usdz` regenerado desde el `.glb` escalado.
- Cache-bust `?v=5` en URLs del modelo.

---

## [v0.4] — 2026-05-29 · Hotspots + Inventario + WhatsApp por unidad

### Added
- **Stats bar de inventario** sobre el viewer: 84 unidades / 67 disponibles / 12 apartadas / 5 vendidas (con dots de color).
- **6 hotspots clickeables** representativos sobre el modelo (PH-01, PH-02, T-301, T-204, T-105, AM-PB).
- Hotspots con color por status (naranja=disponible, ámbar=apartado, rojo=vendido, blanco=amenidad).
- **Sheet/modal de detalle de unidad** — bottom sheet en mobile, modal centrado en desktop. Muestra área, recámaras, baños, precio formateado MXN, status pill.
- **Botón "Apartar por WhatsApp" por unidad** con mensaje pre-llenado (ID, tipo, área, precio).
- Inventario mockeado para Altavía con 6 unidades representativas + amenidades.

---

## [v0.3] — 2026-05-29 · Background #1E3A5F

### Changed
- Color de fondo de página: `#003F8A` (navy brand) → `#1E3A5F` (navy más profundo, menos saturado).
- Rebalance de la paleta de paneles: `--bg-2`, `--bg-3`, `--line` ajustados para mantener jerarquía visual.
- Cache-bust `?v=2` agregado a URLs del modelo (forzar re-descarga post-deploy).

---

## [v0.2] — 2026-05-29 · Modelo real Altavía + Branding navy

### Added
- **Modelo real `IBuilding49.glb` de Revit** integrado, **optimizado 93 MB → 1.5 MB** (60× reducción).
- Pipeline Python para comprimir texturas: 3 PNGs 8192×8192 → 1024×1024 JPEG q82.
- **Variante clara del logo** (`logo-teckio-light.svg`) — 8 paths blancos + 3 naranjas, sustitución de navy `#003F8A` y `#0E4A90` por blanco.
- Datos del demo (mockeados, plausibles): Residencial Altavía · Querétaro · 84 deptos · Q3 2027.
- Botón CTA "Agendar demo por WhatsApp" (placeholder `wa.me/525555555555`).
- Stats demo: `1.5 MB .glb` + `2.9 MB .usdz`.
- Scripts `scripts/convert_glb_to_usdz.mjs` y `scripts/preload.mjs` (polyfills GLTFLoader/USDZExporter en Node).

### Changed
- `<model-viewer>` ahora apunta al modelo real (no la maqueta esquemática sintética).
- `camera-orbit` ajustado para el modelo a escala real (60m).

### Removed
- Texto "GRUPO TECKIO" junto al logo en el header.

### Known issues
- USDZ generado en Node pierde texturas (USDZExporter no puede ejecutar canvas headless completo). iOS Quick Look muestra modelo monocromo; Android (`.glb`) muestra texturizado.

---

## [v0.1] — 2026-05-29 · Plumbing AR base

### Added
- Página estática `index.html` con `<model-viewer>` 4.0.0 (CDN Google).
- Maqueta esquemática sintética generada con Three.js + Node (`build_maqueta.mjs`): base + 3 edificios + acento naranja.
- Exporters `.glb` (GLTFExporter) y `.usdz` (USDZExporter) corriendo en Linux/Node con polyfill mínimo de `FileReader`.
- QR code (`qr.png`) apuntando a la URL de deploy.
- Logo Teckio (`logo-teckio.svg`) en header.
- Estética dark inspirada en Dark Souls life-dashboard del usuario.
- Botón "Ver en mi espacio" para activar AR.
- README inicial con pipeline Revit→Blender→glb documentado.

### Decisions
- Stack fijado: `<model-viewer>` + HTML/CSS/JS estático + GitHub Pages. Sin framework, sin backend.
- iOS Safari = caso frágil identificado; `.usdz` explícito vía `ios-src`.

---

## Decisiones arquitectónicas (rechazadas y por qué)

- **App nativa (rechazada en v0.6):** introduciría friction de instalación que mata el funnel del demo (estimado 5-7× menos leads). Reabrir solo si Teckio firma contrato grande y quiere asset propio en App Store / Play Store.
- **WebXR puro (rechazada):** permitiría hotspots-en-AR pero Apple no implementó WebXR en WebKit → pierdes 100% de iOS. No aceptable para una constructora con base de clientes mixta.
- **8th Wall (no aplicable):** Niantic cerró el producto en febrero 2026. Era LA solución para AR web con UI overlay completa.
- **Niantic Lightship Studio:** opción viable pero enterprise pricing y esfuerzo alto. Esperar a que Teckio firme contrato antes de evaluar.

---

[v0.8]: ./CHANGELOG.md#v08--2026-05-29--dual-mode-scene-viewer-markerless--mindar-tabletop-con-marcador
[v0.7]: ./CHANGELOG.md#v07--2026-05-29--wow-factor--controls-vista--tour--dia-noche--medir
[v0.6]: ./CHANGELOG.md#v06--2026-05-29--multi-proyecto--lead-capture--analytics
[v0.5]: ./CHANGELOG.md#v05--2026-05-29--escala-maqueta--ux-hotspots
[v0.4]: ./CHANGELOG.md#v04--2026-05-29--hotspots--inventario--whatsapp-por-unidad
[v0.3]: ./CHANGELOG.md#v03--2026-05-29--background-1e3a5f
[v0.2]: ./CHANGELOG.md#v02--2026-05-29--modelo-real-altavia--branding-navy
[v0.1]: ./CHANGELOG.md#v01--2026-05-29--plumbing-ar-base
