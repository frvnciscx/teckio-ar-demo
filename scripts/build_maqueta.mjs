// Genera una maqueta esquemática (3 edificios + base) y exporta .glb + .usdz
// Output: assets/maqueta.glb y assets/maqueta.usdz
// Escala: maqueta cabe en ~0.6 x 0.6 m sobre una mesa.
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import fs from 'node:fs';
import path from 'node:path';

const scene = new THREE.Scene();

// Materiales: estética dark/grafito con un acento
const matBase   = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.85, metalness: 0.05 });
const matTorre  = new THREE.MeshStandardMaterial({ color: 0xbfbfbf, roughness: 0.45, metalness: 0.15 });
const matEdif   = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.55, metalness: 0.10 });
const matAcento = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.5,  metalness: 0.2  }); // naranja Teckio

// Base / plaza
const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.01, 0.6), matBase);
base.position.y = 0.005;
scene.add(base);

// Torre principal (centro-derecha)
const torre = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.32, 0.10), matTorre);
torre.position.set(0.10, 0.16 + 0.01, -0.05);
scene.add(torre);

// Remate de torre (acento)
const remate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.06), matAcento);
remate.position.set(0.10, 0.32 + 0.02 + 0.01, -0.05);
scene.add(remate);

// Edificio medio
const edifMedio = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.10), matEdif);
edifMedio.position.set(-0.10, 0.09 + 0.01, 0.05);
scene.add(edifMedio);

// Edificio bajo
const edifBajo = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.14), matEdif);
edifBajo.position.set(-0.05, 0.04 + 0.01, -0.15);
scene.add(edifBajo);

// Plaza/jardín (placita acentuada)
const plaza = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.005, 0.12), matAcento);
plaza.position.set(0.15, 0.015, 0.18);
scene.add(plaza);

// Iluminación (algunos exportadores la ignoran pero no daña)
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(1, 2, 1);
scene.add(dir);

const outDir = path.resolve('./assets_out');
fs.mkdirSync(outDir, { recursive: true });

// --- GLB ---
const gltfExporter = new GLTFExporter();
const glbBuffer = await new Promise((resolve, reject) => {
  gltfExporter.parse(
    scene,
    (result) => resolve(result),
    (err) => reject(err),
    { binary: true }
  );
});
const glbPath = path.join(outDir, 'maqueta.glb');
fs.writeFileSync(glbPath, Buffer.from(glbBuffer));
console.log('GLB escrito:', glbPath, fs.statSync(glbPath).size, 'bytes');

// --- USDZ ---
const usdzExporter = new USDZExporter();
const usdzData = await usdzExporter.parseAsync(scene);
const usdzPath = path.join(outDir, 'maqueta.usdz');
fs.writeFileSync(usdzPath, Buffer.from(usdzData));
console.log('USDZ escrito:', usdzPath, fs.statSync(usdzPath).size, 'bytes');
