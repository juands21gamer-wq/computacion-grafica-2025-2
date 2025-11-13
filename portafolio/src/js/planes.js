import * as THREE from 'three';

let planes = [];

export function initPlanes(scene) {
    const textureLoader = new THREE.TextureLoader();
    
    // Plano 1 - Cambia la ruta de la imagen
    textureLoader.load('./models/textures/2.png', function(texture) {
        const plane1 = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 3),
            new THREE.MeshBasicMaterial({ 
                map: texture,
                side: THREE.DoubleSide 
            })
        );
        plane1.position.set(-1, -1, -4);
        scene.add(plane1);
        planes.push(plane1);
    });
    
    // Plano 2 - Cambia la ruta de la imagen
    textureLoader.load('./models/textures/dumie.png', function(texture) {
        const plane2 = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 3),
            new THREE.MeshBasicMaterial({ 
                map: texture,
                side: THREE.DoubleSide 
            })
        );
        plane2.position.set(4, -1, -2);
        scene.add(plane2);
        planes.push(plane2);
    });
}

export function updatePlanes() {
    // Animación opcional - quita si no la necesitas
    planes.forEach((plane, i) => {
        plane.rotation.y = Math.sin(Date.now() * 0.001 + i) * 0.1;
    });
}