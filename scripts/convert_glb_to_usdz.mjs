import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';
import * as THREE from 'three';
import fs from 'node:fs';

const SRC = process.argv[2];
const DST = process.argv[3];
const buf = fs.readFileSync(SRC);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const loader = new GLTFLoader();

const gltf = await new Promise((res, rej) => {
  loader.parse(ab, '', (g) => res(g), (e) => rej(e));
});
console.log('GLB cargado.');
const box = new THREE.Box3().setFromObject(gltf.scene);
const size = new THREE.Vector3(); box.getSize(size);
console.log('Bbox (m):', size.x.toFixed(2), 'x', size.y.toFixed(2), 'x', size.z.toFixed(2));

// Sustituir cada material por uno sin texturas, conservando color base aproximado
let count = 0;
gltf.scene.traverse((obj) => {
  if (obj.isMesh && obj.material) {
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const newMats = mats.map((m) => {
      const c = m.color ? m.color.clone() : new THREE.Color(0xbfbfbf);
      const nm = new THREE.MeshStandardMaterial({
        color: c,
        roughness: m.roughness ?? 0.75,
        metalness: m.metalness ?? 0.05,
      });
      count++;
      return nm;
    });
    obj.material = Array.isArray(obj.material) ? newMats : newMats[0];
  }
});
console.log(`Materiales sustituidos: ${count}`);

const exp = new USDZExporter();
const usdz = await exp.parseAsync(gltf.scene);
fs.writeFileSync(DST, Buffer.from(usdz));
console.log('USDZ:', fs.statSync(DST).size, 'bytes');
