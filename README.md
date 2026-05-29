# Teckio · WebAR Maqueta (Demo)

Página estática que muestra una maqueta arquitectónica en AR sobre superficies reales, vía cámara del teléfono, sin instalar app. Demo para Grupo Teckio.

URL de deploy esperada: `https://frvnciscx.github.io/teckio-ar-demo/`

---

## Estructura

```
RA/
├── index.html               # Página model-viewer (estética dark)
├── qr.png                   # QR apuntando a la URL de deploy
├── README.md
├── assets/
│   ├── maqueta.glb          # Modelo glTF binario (Android + WebXR)
│   └── maqueta.usdz         # Modelo USDZ (iOS Quick Look)
└── scripts/
    └── build_maqueta.mjs    # Generador Node + Three.js → .glb + .usdz
```

La maqueta de Fase 0 es geometría esquemática (base + 3 volúmenes + acento), generada por código para no depender de modelos externos.

---

## Deploy a GitHub Pages

1. Crea el repo en GitHub: `frvnciscx/teckio-ar-demo`.
2. En esta carpeta:
   ```
   git init
   git add .
   git commit -m "fase 0: plumbing AR"
   git branch -M main
   git remote add origin git@github.com:frvnciscx/teckio-ar-demo.git
   git push -u origin main
   ```
3. En el repo en GitHub → Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / root → Save.
4. Espera ~1 min. La URL será `https://frvnciscx.github.io/teckio-ar-demo/`.
5. Escanea `qr.png` desde el celular (iOS y Android) y prueba el botón **Ver en mi espacio**.

> **HTTPS es obligatorio** para AR. GitHub Pages lo da por defecto.

---

## Criterios de éxito Fase 0

- [ ] iOS Safari: el botón AR abre Quick Look y la maqueta queda anclada en una superficie real.
- [ ] Android Chrome: el botón AR lanza Scene Viewer y la maqueta queda anclada.
- [ ] Desktop: la página carga, se ve el modelo con controles de órbita, el botón AR no rompe nada (no aparece).

Si los tres pasan, el riesgo técnico de AR está muerto y podemos pasar a Fase 1.

---

## Fase 1 — Pipeline Revit → `.glb` + `.usdz` (sin Mac)

Esto reemplaza solo los dos archivos en `assets/`. El `index.html` no cambia.

### A. Revit → glTF (.glb)

Opciones (elige una):

1. **Plugin gratuito**: instala el add-in `glTFRevitExport` (Pawel Block, GitHub: `pawelb-cad/glTFRevitExport`) en Revit. Exporta la vista 3D directamente a `.glb`.
2. **Vía FBX → Blender**: en Revit exporta FBX, abre en Blender (gratis), limpia y exporta como `.glb` (File → Export → glTF 2.0, formato Binary).

### B. Optimización en Blender (recomendado)

Objetivo: `.glb` < 10–15 MB para carga aceptable en móvil con datos.

- Decimate Modifier en geometrías densas (target ratio 0.3–0.6).
- Unifica materiales similares (PBR Standard) — muchos materiales pesan más que muchos polígonos.
- Borra metadata Revit innecesaria (capas vacías, cámaras, luces que no aportan).
- Texturas: máximo 1024×1024, formato KTX2 si es posible (Blender ≥ 4.0).
- Export → glTF 2.0 → Format: `glb`, Include: `Selected Objects` o `Visible Objects`, Geometry: `Apply Modifiers` + `Compression (Draco)`.

### C. `.glb` → `.usdz` (sin Mac, en Windows/Linux)

Tres caminos. Recomendado en orden:

**Opción 1 — Node + Three.js USDZExporter (lo que usamos aquí, repetible):**

```bash
cd scripts
npm init -y
npm install three
node build_from_glb.mjs   # script propio que cargues el .glb y exporte .usdz
```

> En este repo, `scripts/build_maqueta.mjs` genera la maqueta de demo desde cero. Para convertir un `.glb` existente, hay que cargarlo con `GLTFLoader` (en Node requiere polyfills mínimos: `FileReader`, `XMLHttpRequest` o usar `fs.readFileSync` + `parser.parse`). Te lo armo cuando tengas el `.glb` real.

**Opción 2 — Convertidor online (rápido, sin instalar nada):**

- `https://products.aspose.app/3d/conversion/glb-to-usdz` — sube `.glb`, descarga `.usdz`.
- `https://anyconv.com/glb-to-usdz-converter/` — alternativa.

**Riesgo**: la calidad del USDZ en iOS Quick Look varía. Siempre verifica en un iPhone real antes de presentar al cliente. Si Quick Look se queja, prueba la siguiente opción.

**Opción 3 — `usd_from_gltf` (Google, calidad máxima, requiere build):**

Repo: `https://github.com/google/usd_from_gltf`. Compila en WSL/Linux (necesita USD de Pixar). Es la herramienta más fiel pero la más pesada de instalar. Solo si las opciones 1 y 2 fallan.

### D. Reemplazar y volver a probar

1. Sustituye `assets/maqueta.glb` y `assets/maqueta.usdz` por los nuevos.
2. Mantén los mismos nombres (o ajusta `src` e `ios-src` en `index.html`).
3. `git commit` + `git push`.
4. Verifica de nuevo en iOS y Android.

---

## Troubleshooting

| Síntoma | Causa probable | Acción |
|---|---|---|
| iOS no abre Quick Look | `.usdz` mal formado o `ios-src` mal apuntado | Regenera `.usdz` (Opción 2 o 3 arriba). Verifica que `<model-viewer>` tenga `ios-src="assets/maqueta.usdz"`. |
| Android no lanza Scene Viewer | El dispositivo no soporta ARCore | Revisa lista oficial Google. Algunos Android viejos sólo verán el modelo en pantalla, sin AR. |
| El modelo carga pero "tiembla" en AR | Escala demasiado grande o pequeña | Ajusta `ar-scale="fixed"` o cambia las dimensiones en el `.glb` antes de exportar. |
| Carga lenta en datos móviles | `.glb` > 15 MB | Decima en Blender, reduce texturas. |
| Quick Look muestra modelo gris/sin materiales | Materiales no PBR o texturas faltantes en el `.usdz` | Re-exporta forzando materiales PBR estándar en Blender antes de convertir. |

---

## Fase 2 — Futura (no parte de este demo)

Hotspots de model-viewer para mostrar precio unitario / avance de obra desde ERP. Migración a Three.js puro si se requiere lógica más rica. El código actual ya está aislado en una sola página estática — sustituirla por una app Three.js completa no implica rehacer infra.

---

## Notas técnicas

- `model-viewer` versión 4.0.0 vía CDN de Google.
- `ar-modes="webxr scene-viewer quick-look"` cubre los tres caminos (WebXR para Android Chrome reciente, Scene Viewer fallback en Android, Quick Look en iOS).
- Sin backend, sin framework, sin build step. Puro estático.
