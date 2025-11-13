import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { enemies } from './entities.js';

let player, camera;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let keys = {};

const SPEED = 6.0;
const GRAVITY = -20.0;
const JUMP_FORCE = 8.0;
let pitch = 0;
let isOnGround = false;

const PLAYER_HEIGHT = 0.8;
const PLAYER_RADIUS = 0.5;
const PLAYER_EYE_HEIGHT = PLAYER_HEIGHT * 1;

let weapon;
let isShooting = false;

// === CORRECCIÓN: Usar raycasters separados ===
const shootRaycaster = new THREE.Raycaster(); // Solo para disparos
const collisionRaycaster = new THREE.Raycaster(); // Solo para colisiones

// === NUEVO: Posición segura por defecto ===
const SAFE_SPAWN_POSITION = new THREE.Vector3(0, PLAYER_HEIGHT, 5);

// === NUEVO: Función para verificar si la posición es segura ===
function isPositionSafe(position) {
    // Verificar si hay suelo debajo del jugador
    const groundCheckRaycaster = new THREE.Raycaster();
    groundCheckRaycaster.set(position, new THREE.Vector3(0, -1, 0));
    groundCheckRaycaster.far = 10; // Buscar suelo hasta 10 unidades abajo
    
    const intersects = groundCheckRaycaster.intersectObjects(window.worldMeshes || [], true);
    
    // Si hay suelo a una distancia razonable, la posición es segura
    return intersects.length > 0 && intersects[0].distance <= 5;
}

// === NUEVO: Encontrar posición segura más cercana ===
function findSafePosition(currentPosition) {
    const positionsToCheck = [
        currentPosition,
        new THREE.Vector3(0, PLAYER_HEIGHT, 5), // Posición inicial
        new THREE.Vector3(5, PLAYER_HEIGHT, 5),
        new THREE.Vector3(-5, PLAYER_HEIGHT, 5),
        new THREE.Vector3(0, PLAYER_HEIGHT, 10),
        new THREE.Vector3(0, PLAYER_HEIGHT, 0)
    ];
    
    for (let pos of positionsToCheck) {
        if (isPositionSafe(pos)) {
            console.log('📍 Posición segura encontrada:', pos);
            return pos;
        }
    }
    
    // Si no encuentra ninguna posición segura, usar la por defecto
    console.log('⚠️ Usando posición por defecto');
    return SAFE_SPAWN_POSITION.clone();
}

// === NUEVO: Funciones para guardar/cargar posición ===
export function savePlayerPosition() {
    if (player) {
        // Solo guardar si está en una posición razonable (no cayendo al vacío)
        if (player.position.y > -10 && player.position.y < 100) {
            const position = {
                x: player.position.x,
                y: player.position.y, 
                z: player.position.z,
                rotationY: player.rotation.y,
                pitch: pitch
            };
            localStorage.setItem('playerPosition', JSON.stringify(position));
            console.log('💾 Posición guardada:', position);
        } else {
            console.log('⚠️ No se guardó posición (posición inválida)');
            localStorage.removeItem('playerPosition');
        }
    }
}

export function loadPlayerPosition() {
    if (player) {
        const saved = localStorage.getItem('playerPosition');
        if (saved) {
            try {
                const position = JSON.parse(saved);
                const savedPosition = new THREE.Vector3(position.x, position.y, position.z);
                
                // Verificar si la posición guardada es segura
                if (isPositionSafe(savedPosition)) {
                    player.position.copy(savedPosition);
                    player.rotation.y = position.rotationY;
                    pitch = position.pitch || 0;
                    camera.rotation.x = pitch;
                    console.log('📂 Posición cargada:', position);
                } else {
                    console.log('⚠️ Posición guardada no es segura, buscando alternativa...');
                    const safePosition = findSafePosition(savedPosition);
                    player.position.copy(safePosition);
                    player.rotation.y = 0;
                    pitch = 0;
                    camera.rotation.x = 0;
                }
            } catch (error) {
                console.error('Error al cargar posición:', error);
                resetPlayerPosition();
            }
        }
    }
}

export function resetPlayerPosition() {
    if (player) {
        const safePosition = findSafePosition(SAFE_SPAWN_POSITION);
        player.position.copy(safePosition);
        player.rotation.y = 0;
        pitch = 0;
        camera.rotation.x = 0;
        velocity.set(0, 0, 0);
        localStorage.removeItem('playerPosition');
        console.log('🔄 Posición reiniciada a:', safePosition);
    }
}

export function initPlayer(scene, cam) {
    player = new THREE.Object3D();
    
    camera = cam;
    camera.position.set(0, PLAYER_EYE_HEIGHT, 0);
    player.add(camera);
    scene.add(player);

    // Inicializar el jugador en una posición segura
    resetPlayerPosition();

    velocity.y = 0;

    initWeapon();

    document.addEventListener('keydown', (e) => keys[e.code] = true);
    document.addEventListener('keyup', (e) => keys[e.code] = false);

    document.body.addEventListener('click', () => {
        document.body.requestPointerLock();
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement !== document.body) return;

        const sensitivity = 0.002;
        player.rotation.y -= e.movementX * sensitivity;
        pitch -= e.movementY * sensitivity;
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
        camera.rotation.x = pitch;
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && isOnGround) {
            velocity.y = JUMP_FORCE;
            isOnGround = false;
        }
        
        // === NUEVO: Tecla para resetear posición ===
        if (e.code === 'KeyR') {
            resetPlayerPosition();
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) shoot(scene);
    });

    // === NUEVO: Guardar posición automáticamente cada 10 segundos ===
    setInterval(() => {
        savePlayerPosition();
    }, 10000);

    // === NUEVO: Detección de caída al vacío ===
    setInterval(() => {
        if (player && player.position.y < -20) {
            console.log('🆘 Jugador cayendo al vacío, reseteando posición...');
            resetPlayerPosition();
        }
    }, 2000);

    console.log('🎮 Jugador inicializado con sistema de guardado seguro');
}

function initWeapon() {
    weapon = new THREE.Group();
    const loader = new GLTFLoader();

    loader.load(
        'models/weapon.glb',
        (gltf) => {
            const weaponModel = gltf.scene;
            weaponModel.scale.set(0.1, 0.1, 0.1);
            weaponModel.rotation.y = 1.5;
            weapon.add(weaponModel);

            const muzzlePoint = new THREE.Object3D();
            muzzlePoint.position.set(0, 0.3, -0.6);
            weapon.add(muzzlePoint);
            weapon.userData.muzzlePoint = muzzlePoint;

            const flashGeometry = new THREE.ConeGeometry(0.05, 0.2, 100);
            const flashMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00, emissive: 0xffff00 });
            const muzzleFlash = new THREE.Mesh(flashGeometry, flashMaterial);
            muzzleFlash.rotation.x = Math.PI / 2;
            muzzleFlash.visible = false;
            muzzlePoint.add(muzzleFlash);
            weapon.userData.muzzleFlash = muzzleFlash;

            camera.add(weapon);
            weapon.position.set(0.5, -0.5, -1);
            weapon.rotation.x = 0.1;
        },
        (progress) => {
            console.log('Cargando arma...', (progress.loaded / progress.total * 100).toFixed(0) + '%');
        },
        (error) => {
            console.error('Error al cargar el modelo GLB:', error);
        }
    );
}

function shoot(scene) {
    if (isShooting || !weapon) return;
    isShooting = true;

    // Animación simple del arma
    const originalZ = weapon.position.z;
    weapon.position.z += 0.1;
    setTimeout(() => {
        weapon.position.z = originalZ;
        isShooting = false;
    }, 100);

    // Efecto de fogonazo
    if (weapon.userData.muzzleFlash) {
        const flash = weapon.userData.muzzleFlash;
        flash.visible = true;
        setTimeout(() => (flash.visible = false), 50);
    }

    // Obtener posición y dirección del disparo
    const muzzleWorldPos = new THREE.Vector3();
    weapon.userData.muzzlePoint.getWorldPosition(muzzleWorldPos);

    const shootDir = new THREE.Vector3();
    camera.getWorldDirection(shootDir);
    shootDir.normalize();

    console.log('📍 Posición del cañón:', muzzleWorldPos);
    console.log('➡️ Dirección del disparo:', shootDir);

    // === CORRECCIÓN: Usar shootRaycaster en lugar del raycaster compartido ===
    shootRaycaster.set(muzzleWorldPos, shootDir);
    shootRaycaster.far = 1000; // Distancia larga para el disparo

    // Visualizar el disparo (línea amarilla)
    const bulletLength = 100;
    const lineGeom = new THREE.BufferGeometry().setFromPoints([
        muzzleWorldPos,
        muzzleWorldPos.clone().add(shootDir.clone().multiplyScalar(bulletLength)),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const bulletLine = new THREE.Line(lineGeom, lineMat);
    scene.add(bulletLine);
    setTimeout(() => {
        scene.remove(bulletLine);
        lineGeom.dispose();
        lineMat.dispose();
    }, 80);

    // === Detectar intersección con enemigos ===
    if (!enemies || enemies.length === 0) {
        console.warn('⚠️ No hay enemigos en escena.');
        return;
    }

    // ✅ Solo raycast contra enemigos visibles y vivos
    const validEnemies = enemies.filter(e => e.visible && !e.userData.isDead);
    
    // === CORRECCIÓN: Usar shootRaycaster y buscar solo en los objetos principales (false) ===
    const hits = shootRaycaster.intersectObjects(validEnemies, false);
    console.log('🔍 Intersecciones detectadas:', hits.length);

    if (hits.length > 0) {
        // Tomar el enemigo más cercano
        const hit = hits[0];
        const enemy = hit.object; // Ahora es directamente el enemigo

        console.log(`💥 Enemigo golpeado: ${enemy.userData.name}`);
        console.log(`❤️ Vida antes: ${enemy.userData.health}`);

        // Efecto visual del impacto
        const hitPoint = hit.point;
        const impactGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const impactMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const impactMark = new THREE.Mesh(impactGeo, impactMat);
        impactMark.position.copy(hitPoint);
        scene.add(impactMark);
        setTimeout(() => scene.remove(impactMark), 300);

        // Reducir vida del enemigo
        enemy.userData.health -= 20;

        if (enemy.userData.health > 0) {
            console.log(`💢 Vida restante: ${enemy.userData.health}`);
            // Cambio de color temporal para feedback visual
            const originalColor = enemy.material.color.clone();
            enemy.material.color.set(0xffaa00);
            setTimeout(() => enemy.material.color.copy(originalColor), 200);
        } else {
            console.log(`☠️ Enemigo ${enemy.userData.name} eliminado`);
            enemy.userData.isDead = true;
        }
    } else {
        console.log('❌ No se acertó a ningún enemigo.');
    }
}

function checkCollision(pos, deltaMove) {
    const futurePos = pos.clone().add(deltaMove);

    const directions = [
        new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, player.rotation.y, 0)),
        new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(0, player.rotation.y, 0)),
        new THREE.Vector3(-1, 0, 0).applyEuler(new THREE.Euler(0, player.rotation.y, 0)),
        new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, player.rotation.y, 0)),
    ];

    for (let dir of directions) {
        // === CORRECCIÓN: Usar collisionRaycaster para colisiones ===
        collisionRaycaster.set(futurePos, dir);
        collisionRaycaster.far = PLAYER_RADIUS;
        const intersects = collisionRaycaster.intersectObjects(window.worldMeshes || [], true);

        if (intersects.length > 0) {
            const distance = intersects[0].distance;
            if (distance < PLAYER_RADIUS) {
                return true;
            }
        }
    }

    return false;
}

function checkGround() {
    const down = new THREE.Vector3(0, -1, 0);
    
    // === CORRECCIÓN: Usar collisionRaycaster para detección de suelo ===
    collisionRaycaster.set(player.position, down);
    collisionRaycaster.far = PLAYER_HEIGHT + 0.1;

    const intersects = collisionRaycaster.intersectObjects(window.worldMeshes || [], true);

    if (intersects.length > 0 && intersects[0].distance <= PLAYER_HEIGHT + 0.1) {
        isOnGround = true;
        velocity.y = 0;
        player.position.y = intersects[0].point.y + PLAYER_HEIGHT;
    } else {
        isOnGround = false;
    }
}

export function updatePlayer(delta) {
    velocity.y += GRAVITY * delta;

    direction.set(0, 0, 0);

    if (keys['KeyW']) direction.z -= 1;
    if (keys['KeyS']) direction.z += 1;
    if (keys['KeyA']) direction.x -= 1;
    if (keys['KeyD']) direction.x += 1;

    direction.normalize();

    const move = new THREE.Vector3(direction.x, 0, direction.z);
    move.applyEuler(new THREE.Euler(0, player.rotation.y, 0));
    move.multiplyScalar(SPEED * delta);

    if (!checkCollision(player.position, move)) {
        player.position.add(move);
    }

    player.position.y += velocity.y * delta;

    checkGround();
}

// === NUEVO: Hacer funciones disponibles globalmente ===
window.savePlayerPosition = savePlayerPosition;
window.loadPlayerPosition = loadPlayerPosition;
window.resetPlayerPosition = resetPlayerPosition;