import * as THREE from 'three';
import { initWorld } from './world.js';
import { initPlayer, updatePlayer } from './player.js';
import { initEntities, updateEntities } from './entities.js';
import { initUI, updateUI } from './ui.js';
import { unlockProject } from './ui.js';
import { initPlanes, updatePlanes } from './planes.js';

// Hacer las variables globales para que menu.js pueda acceder
let scene, camera, renderer, clock;

// Exportar renderer para que menu.js pueda acceder
export { renderer };

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Insertar el canvas en el contenedor del juego
    const gameScreen = document.getElementById('gameScreen');
    gameScreen.appendChild(renderer.domElement);

    // Hacer el renderer global
    window.renderer = renderer;

    clock = new THREE.Clock();

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    initWorld(scene);
    initPlayer(scene, camera);
    initEntities(scene);
    initUI();
    initPlanes(scene);

    window.addEventListener('resize', onWindowResize);
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    updatePlayer(delta);
    updateEntities(delta, scene, camera);
    updateUI();
    updatePlanes();

    renderer.render(scene, camera);
}

