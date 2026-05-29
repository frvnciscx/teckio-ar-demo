/* ==========================================================================
   Teckio · Datos compartidos entre index.html (Scene Viewer) y tabletop.html (MindAR)
   Edita aquí UNA sola vez y ambas páginas se actualizan.
   ========================================================================== */
window.TECKIO = window.TECKIO || {};

/* --- Constantes editables --- */

// Webhook donde se envían los leads del formulario (n8n, Make, Zapier, Apps Script).
// Vacío = solo localStorage (no envía al CRM).
window.TECKIO.LEAD_WEBHOOK = '';

// Webhook de analytics. Vacío = solo console.log.
window.TECKIO.ANALYTICS_WEBHOOK = '';

// Número WhatsApp Teckio (código país sin "+").
window.TECKIO.WA_NUMBER = '525555555555';


/* --- Catálogo de proyectos.  Acceso vía ?p=key en ambas URLs. --- */

window.TECKIO.PROJECTS = {

  altavia: {
    key: 'altavia',
    name: 'Residencial Altavía',
    location: 'Querétaro, Qro.',
    tipologia: 'Vertical residencial',
    unidades: 84,
    entrega: 'Q3 2027',
    tagline: 'Vivienda vertical con diseño contemporáneo en el corredor norte de Querétaro.',
    modelGlb:  'assets/maqueta.glb?v=8',
    modelUsdz: 'assets/maqueta.usdz?v=8',
    stats: { disponibles: 67, apartadas: 12, vendidas: 5 },

    // Hotspots para modo MARKERLESS (index.html).
    // Coords del modelo escalado 0.02× (bbox ~0.75 × 0.19 × 0.35 m, centro origen XZ).
    hotspotsMarkerless: [
      { unit: 'PH-01', position: '0.30 0.17 0.14',  normal: '0 0 1', status: 'disponible' },
      { unit: 'PH-02', position: '-0.30 0.17 0.14', normal: '0 0 1', status: 'apartado'  },
      { unit: 'T-301', position: '0.20 0.11 0.14',  normal: '0 0 1', status: 'disponible' },
      { unit: 'T-204', position: '-0.20 0.11 0.14', normal: '0 0 1', status: 'disponible' },
      { unit: 'T-105', position: '0.16 0.05 0.14',  normal: '0 0 1', status: 'vendido'    },
      { unit: 'AM-PB', position: '0 0.02 0.16',     normal: '0 0 1', status: 'amenidad'   },
    ],

    // Hotspots para modo MARKER (tabletop.html, MindAR).
    // Coords relativas al anchor del marcador. Y vertical, Z hacia adelante del marcador.
    // El modelo se escala dentro del scene; estas coords son las MISMAS proporciones que
    // markerless, pero el modelo en MindAR no usa el wrapper 0.02×, así que aplicamos *5.
    hotspotsMarker: [
      { unit: 'PH-01', x:  0.30, y: 0.17, z:  0.14, status: 'disponible' },
      { unit: 'PH-02', x: -0.30, y: 0.17, z:  0.14, status: 'apartado'  },
      { unit: 'T-301', x:  0.20, y: 0.11, z:  0.14, status: 'disponible' },
      { unit: 'T-204', x: -0.20, y: 0.11, z:  0.14, status: 'disponible' },
      { unit: 'T-105', x:  0.16, y: 0.05, z:  0.14, status: 'vendido'    },
      { unit: 'AM-PB', x:  0,    y: 0.02, z:  0.16, status: 'amenidad'   },
    ],

    units: {
      'PH-01': { label: 'PH-01', floor: 'Piso 3', type: 'Penthouse Este',  area: 142, bedrooms: 3, baths: 2.5, price: 6800000, status: 'disponible' },
      'PH-02': { label: 'PH-02', floor: 'Piso 3', type: 'Penthouse Oeste', area: 138, bedrooms: 3, baths: 2.5, price: 6500000, status: 'apartado' },
      'T-301': { label: 'T-301', floor: 'Piso 3', type: 'Tipo C · 3 rec',  area:  95, bedrooms: 3, baths: 2,   price: 4200000, status: 'disponible' },
      'T-204': { label: 'T-204', floor: 'Piso 2', type: 'Tipo B · 2 rec',  area:  72, bedrooms: 2, baths: 1,   price: 2800000, status: 'disponible' },
      'T-105': { label: 'T-105', floor: 'Piso 1', type: 'Tipo A · 1 rec',  area:  54, bedrooms: 1, baths: 1,   price: 1900000, status: 'vendido' },
      'AM-PB': { label: 'AM',    floor: 'Planta baja', type: 'Amenidades', amenidades: true,
                 amenities: ['Alberca semi-olímpica', 'Gimnasio equipado', 'Salón de usos múltiples', 'Roof garden', 'Co-working', 'Pet park'] },
    },
  },

  // Para agregar un proyecto nuevo: duplica el bloque y cambia key, copy, modelGlb/Usdz, units.

};

/* --- Resolver proyecto desde URL --- */
window.TECKIO.resolveProject = function() {
  const params = new URLSearchParams(location.search);
  const key = (params.get('p') || params.get('proyecto') || 'altavia').toLowerCase();
  return window.TECKIO.PROJECTS[key] || window.TECKIO.PROJECTS.altavia;
};
