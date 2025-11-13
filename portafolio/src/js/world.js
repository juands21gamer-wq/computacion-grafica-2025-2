import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let worldMeshes = [];

export async function initWorld(scene) {
  const loader = new GLTFLoader();

  try {
    const gltf = await loader.loadAsync('models/assets/mapacity1.glb');
    const mapa = gltf.scene;

    mapa.position.set(0, 0, 0);
    mapa.scale.set(1, 1, 1);
    mapa.rotation.y = 0;

    mapa.traverse((child) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide;
        child.castShadow = true;
        child.receiveShadow = true;

        // Añadir a la lista de mallas colisionables
        worldMeshes.push(child);
      }
    });

    scene.add(mapa);

    // Guardamos las mallas para que otros módulos las puedan usar
    window.worldMeshes = worldMeshes;
  } catch (error) {
    console.error('Error al cargar el mapa GLB:', error);
  }
}

export { worldMeshes };