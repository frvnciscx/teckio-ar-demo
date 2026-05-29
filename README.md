# Teckio · WebAR Maqueta

Página estática que muestra una maqueta arquitectónica en AR sobre superficies reales, vía cámara del teléfono, sin instalar app. Soporta múltiples proyectos, lead capture pre-AR y analytics granular.

**URL de deploy:** `https://frvnciscx.github.io/teckio-ar-demo/`

**Versión actual:** v0.6 — ver [CHANGELOG.md](./CHANGELOG.md) para historial.

---

## Estructura

```
RA/
├── index.html                     # Página única, todo en un archivo
├── README.md                      # Este archivo
├── CHANGELOG.md                   # Historial de versiones
├── qr.png                         # QR apuntando a la URL de deploy
├── assets/
│   ├── logo-teckio.svg            # Logo navy (sobre fondo claro)
│   ├── logo-teckio-light.svg      # Logo blanco (sobre fondo oscuro, usado en página)
│   ├── maqueta.glb                # Modelo principal (Android/desktop, texturizado)
│   └── maqueta.usdz               # Modelo principal (iOS Quick Look, sin texturas)
└── scripts/
    ├── build_maqueta.mjs          # Genera maqueta esquemática sintética (Three.js + Node)
    ├── convert_glb_to_usdz.mjs    # Convierte .glb → .usdz (USDZExporter Three.js)
    └── preload.mjs                # Polyfills para correr GLTFLoader en Node
```

---

## Configuración rápida (lo que TÚ debes editar)

En `index.html`, dentro del `<script>` principal, hay un bloque `CONFIG` con 3 constantes que controlan integraciones externas:

```js
// Webhook que recibe leads del formulario (n8n / Make / Zapier / Apps Script).
// Vacío = los leads solo se guardan en localStorage (perdidos al limpiar caché).
const LEAD_WEBHOOK = '';

// Webhook que recibe eventos de analytics. Vacío = solo console.log.
const ANALYTICS_WEBHOOK = '';

// Número WhatsApp de Teckio (código país sin "+"). Aparece en todos los CTAs.
const WA_NUMBER = '525555555555';   // ← cambiar por número real
```

**Adicional opcional — Plausible Analytics:** descomenta el `<script>` en `<head>` y pon tu dominio. Los eventos `track()` se envían automáticamente.

---

## Deploy a GitHub Pages

1. Crea el repo `frvnciscx/teckio-ar-demo` en GitHub (vacío, sin README/gitignore).
2. Desde esta carpeta:
   ```bash
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/frvnciscx/teckio-ar-demo.git
   git push -u origin main
   ```
3. En el repo → Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `/ (root)` → Save.
4. Espera ~1 min. La URL será `https://frvnciscx.github.io/teckio-ar-demo/`.

**HTTPS es obligatorio para AR.** GitHub Pages lo provee por default.

---

## Multi-proyecto (un dominio, N proyectos)

El sistema soporta múltiples proyectos desde el mismo deploy. URL pattern:

- `https://frvnciscx.github.io/teckio-ar-demo/` → default (`altavia`)
- `https://frvnciscx.github.io/teckio-ar-demo/?p=altavia` → Residencial Altavía
- `https://frvnciscx.github.io/teckio-ar-demo/?p=siena` → Torres Siena (ejemplo, requiere descomentar)

### Cómo agregar un proyecto nuevo

1. **Procesa su `.glb` de Revit** siguiendo la sección [Pipeline del modelo](#pipeline-del-modelo-revit--glb--usdz).
2. **Copia los archivos** a `assets/`:
   ```
   assets/siena.glb
   assets/siena.usdz
   ```
3. **Agrega el bloque del proyecto** en `index.html` dentro del objeto `PROJECTS`:
   ```js
   siena: {
     key: 'siena',
     name: 'Torres Siena',
     location: 'San Miguel de Allende, Gto.',
     tipologia: 'Vertical residencial',
     unidades: 56,
     entrega: 'Q1 2028',
     tagline: 'Lofts contemporáneos en el centro histórico.',
     modelGlb:  'assets/siena.glb',
     modelUsdz: 'assets/siena.usdz',
     stats: { disponibles: 48, apartadas: 6, vendidas: 2 },
     units: { /* ver Altavía como referencia */ },
   },
   ```
4. **Genera un QR específico** que apunte a `https://.../?p=siena` y pégalo en folletos de Siena.

Cada proyecto tiene su propio flag de lead capture en localStorage — un usuario que ya dio sus datos en Altavía sigue viendo el form en Siena.

---

## Pipeline del modelo (Revit → glb → usdz)

Los exports de Revit pesan en promedio 80–150 MB. Sin optimización, son inusables en móvil con datos. El proceso documentado:

### 1. Export desde Revit a `.glb`

- **Opción A** (recomendada): plugin gratuito `glTFRevitExport` (Pawel Block) — exporta vista 3D directo.
- **Opción B**: FBX → Blender → File → Export → glTF 2.0 (formato binario).

### 2. Optimización de texturas (Python + PIL)

El 99% del peso son las texturas. Script optimizador:

```python
# Compactar texturas 8K → 1K JPEG q82
# In: in.glb (93 MB)  Out: out_optimized.glb (1.5 MB)  ratio: 60×
# Implementación: parsea GLB, extrae bufferViews de imágenes, redimensiona con PIL,
# re-encodea como JPEG progresivo, reconstruye binary chunk con offsets nuevos.
```

(El script vive en el historial — pídelo si necesitas re-ejecutarlo).

### 3. Escalar para AR manipulable

Si el modelo es a escala real (>10 m), Scene Viewer/Quick Look lo tratan como "world scale" y bloquean manipulación. Para que el usuario pueda arrastrar/rotar el modelo en AR, lo envolvemos en un nodo root con `scale=[0.02, 0.02, 0.02]` → modelo a tamaño maqueta de mesa (~75 cm).

### 4. Generar `.usdz` para iOS

```bash
cd scripts
npm install three @napi-rs/canvas
node --import ./preload.mjs convert_glb_to_usdz.mjs \
     ../assets/maqueta.glb ../assets/maqueta.usdz
```

**Limitación conocida:** el USDZExporter de Three.js corriendo en Node **dropea las texturas** (no puede ejecutar canvas headless completo). El `.usdz` resultante tiene geometría correcta pero **materiales monocromos**. iOS Quick Look muestra modelo gris; Android (que usa el `.glb`) muestra texturizado. Si necesitas USDZ con texturas, alternativas:

| Vía | Costo | Calidad |
|---|---|---|
| Apple Reality Converter | Gratis, solo macOS | Excelente |
| Aspose online glb→usdz | Gratis web | Buena |
| `usd_from_gltf` (Google) | Compilar en Linux | Excelente, doloroso de setup |

---

## Sistema de Lead Capture

El click en "Ver en mi espacio" intercepta el dispatch interno de model-viewer:

1. Si `localStorage[teckio_lead_<project_key>]` está vacío o expirado (>30 días) → abre modal con form.
2. Form requiere `nombre` (≥2 chars) + `teléfono` (≥10 dígitos numéricos). `presupuesto` es opcional.
3. Submit dispara `fetch()` POST fire-and-forget al `LEAD_WEBHOOK`, marca flag en localStorage, abre AR.
4. "Continuar sin registrarme" salta el form sin marcar flag (siguiente visita verá form de nuevo).

### Payload enviado al webhook

```json
{
  "name": "Juan Pérez",
  "phone": "5212345678",
  "budget": "3-5m",
  "project": "altavia",
  "project_name": "Residencial Altavía",
  "ts": 1748534400000
}
```

Sugerencia: tu webhook (n8n / Make / Zapier) debe (a) validar anti-spam, (b) push al CRM, (c) mandar autoresponder al lead vía email/WhatsApp.

---

## Sistema de Analytics

Función `track(event, props)` global. Cada evento se envía simultáneamente a 4 destinos:

1. `console.log` (debugging)
2. `window.dataLayer` (compatible Google Tag Manager / GA4)
3. `window.plausible()` si Plausible está cargado en `<head>`
4. `fetch()` POST al `ANALYTICS_WEBHOOK` (si está configurado)

### Eventos disparados

| Evento | Props | Disparado en |
|---|---|---|
| `page_view` | `user_agent`, `referrer` | Carga inicial |
| `ar_intent` | — | Click en "Ver en mi espacio" |
| `lead_form_open` | — | Modal del form se abre |
| `lead_form_submit` | `has_budget` | Submit exitoso |
| `lead_form_skip` | — | Click "Continuar sin registrarme" |
| `lead_form_close` | — | Backdrop click / Escape |
| `ar_start` | — | `ar-status=session-started` |
| `ar_end` | `duration_s` | `ar-status=not-presenting` después de start |
| `ar_failed` | — | `ar-status=failed` |
| `hotspot_click` | `unit`, `status` | Tap en hotspot |
| `sheet_view` | `unit`, `type`, `status` | Modal de detalle abierto |
| `cta_whatsapp_global_click` | — | CTA global "Agendar demo" |
| `cta_whatsapp_unit_click` | `unit`, `status` | CTA dentro del sheet de unidad |

Todos los eventos incluyen `project` (key) y `ts` (timestamp) automáticamente.

---

## Hotspots

6 hotspots representativos sobre el modelo Altavía. Posiciones en coordenadas del modelo (ya escalado a 75cm):

| Slot | Posición (x y z) | Unit ID | Status |
|---|---|---|---|
| `hotspot-PH-01` | `0.30 0.17 0.14` | PH-01 | disponible |
| `hotspot-PH-02` | `-0.30 0.17 0.14` | PH-02 | apartado |
| `hotspot-T-301` | `0.20 0.11 0.14` | T-301 | disponible |
| `hotspot-T-204` | `-0.20 0.11 0.14` | T-204 | disponible |
| `hotspot-T-105` | `0.16 0.05 0.14` | T-105 | vendido |
| `hotspot-AM-PB` | `0 0.02 0.16` | AM-PB | amenidad |

Para reubicar: edita `data-position` de cada `<button slot="hotspot-...">` en `index.html`. Las coordenadas son las del modelo escalado (0.02× del bbox original Revit de 37×9×18 m).

---

## Limitaciones conocidas

### AR (Scene Viewer / Quick Look)

- **Los hotspots NO funcionan en AR mode.** Scene Viewer (Android) y Quick Look (iOS) son apps nativas separadas. El navegador deja de correr, el DOM muere, los hotspots desaparecen. Por diseño de Google/Apple, no es bug de este código. El listener `ar-status` los oculta proactivamente.
- **Gestos hardcoded en AR.** No podemos customizar cómo se mueve/rota el modelo dentro de Scene Viewer o Quick Look. Los gestos default son: 1 dedo arrastrar = mover, 2 dedos = rotar/escalar.
- **Tracking SLAM inestable.** ARCore/ARKit pierden anchors si: el usuario mueve el celular rápido, apunta a paredes blancas/superficies brillantes, o hay poca luz. Mitigación UX: el sistema muestra "vuelve a apuntar al piso" cuando pierde tracking. Es física, no código.

### iOS

- **USDZ sin texturas.** Ver sección [Pipeline](#pipeline-del-modelo-revit--glb--usdz). Workaround manual con Aspose/Reality Converter si importa estéticamente.
- **WebXR no soportado en iOS.** Apple no implementó WebXR en WebKit. Esto cierra la puerta a hotspots-en-AR para iOS sin usar nativa.

### General

- **No hay validación server-side del form.** Depende del webhook receptor (debe rechazar spam, validar campos, rate-limit).
- **localStorage es del navegador.** Si el usuario borra datos del sitio, vuelve a ver el form.

---

## Troubleshooting

| Síntoma | Causa probable | Acción |
|---|---|---|
| GitHub Pages 404 "There isn't a GitHub Pages site here" | Pages no activado o repo privado | Settings → Pages → activar source `main / root`. Repo debe ser Public en cuenta Free. |
| Modelo no actualiza en celular tras push | Cache del navegador o GitHub CDN | URLs del modelo ya tienen `?v=N` cache-bust. Ctrl+Shift+R en desktop. En móvil: cerrar browser completo + reabrir. |
| iOS no abre Quick Look | `.usdz` corrupto o `ios-src` mal apuntado | Regenerar con Aspose online. Verificar URL en DevTools del Safari (Mac → Safari → Develop → iPhone). |
| Android no lanza Scene Viewer | Dispositivo sin ARCore | Verificar dispositivo en [lista oficial Google](https://developers.google.com/ar/devices). Algunos Android viejos solo ven inline. |
| Modelo no manipulable en AR | Modelo a "world scale" (demasiado grande) | Asegurarse que el `.glb` está escalado a tamaño maqueta (~75cm). Ver [Pipeline §3](#pipeline-del-modelo-revit--glb--usdz). |
| Modelo "tiembla" o se sale de foco | ARCore/ARKit perdió tracking | Apuntar al piso, esperar 3-5 seg. Iluminar bien la habitación. No es bug. |
| Hotspots no se ven en página | `.glb` no cargó o coords fuera del modelo | DevTools → Network → ver si `.glb` 200. Coords en `data-position` deben caer dentro del bbox del modelo escalado. |
| Lead form no envía a webhook | `LEAD_WEBHOOK` vacío o CORS bloqueando | Llenar constante. El webhook debe permitir CORS desde tu dominio GitHub Pages. |

---

## Roadmap (no implementado, en orden de valor)

**Tier 2 — wow factor presentación:**
- Material variants (toggle fachada blanca/terracota/gris vía KHR_materials_variants)
- Sun study slider (hora del día → sombras reales)
- Camera presets (botones fachada/aérea/planta)
- Floor exploder (animación que separa pisos)

**Tier 3 — nice to have:**
- PDF brochure download desde el sheet
- Modo medir (tocar 2 puntos, mostrar distancia)
- Floorplan 2D overlay toggle

**Descartado:**
- App nativa — friction kills funnel, ROI negativo vs web AR para visualización inmobiliaria. Reabrir solo si Teckio firma contrato de proyecto grande y quiere asset propio en stores.
- Hotspots en AR mode — bloqueado por arquitectura Scene Viewer/Quick Look. Alternativas (Niantic Lightship, 8th Wall) o son caras o cerraron (8th Wall shutdown feb 2026).

---

## Stack técnico

- **model-viewer 4.0.0** (Google) vía CDN
- **HTML/CSS/JS estático** — sin framework, sin build step
- **GitHub Pages** para deploy
- **localStorage** para flag de lead capture
- **fetch API** para webhooks (fire-and-forget)
- Opcional: Plausible Analytics, Google Tag Manager, n8n/Make/Zapier para webhooks

---

## Contacto técnico

Para issues, mejoras o agregar proyectos, este repo es la fuente de verdad. Cualquier cambio debe reflejarse en `CHANGELOG.md`.
