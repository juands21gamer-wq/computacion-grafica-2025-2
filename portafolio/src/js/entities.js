import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { unlockProject } from './ui.js';

export let enemies = [];
let modelLoading = false;
const enemyLoadPromises = [];

export function initEntities(scene) {
  createEnemies(scene);
}

function createEnemies(scene) {
  const enemyData = [
    { name: "proyecto de modelado 3d", position: new THREE.Vector3(22, -5.5, 0), scale: 1 },
    { name: "skills: ", position: new THREE.Vector3(9, -5.5, -19), scale: 1 },
    { name: "HOJA DE VIDA", position: new THREE.Vector3(11, -5.5, -43), scale: 1 },
    { name: "MERITOS", position: new THREE.Vector3(25, -5.5, -37), scale: 1 },
    { name: "proyecto audiovisual", position: new THREE.Vector3(19, -3, -12), scale: 1 },
  ];

  // Cargar un modelo GLB independiente para cada enemigo
  enemyData.forEach((data, index) => {
    loadEnemyModel(scene, data, index);
  });
}

function loadEnemyModel(scene, data, index) {
  const loader = new GLTFLoader();
  
  console.log(`🔄 Cargando modelo para ${data.name}...`);
  
  loader.load(
    './models/assets/pj1.glb',
    (gltf) => {
      console.log(`✅ Modelo cargado para ${data.name}`);
      createEnemyFromGLB(scene, gltf.scene, data, index);
    },
    (progress) => {
      const percent = (progress.loaded / progress.total * 100).toFixed(0);
      console.log(`📦 ${data.name}: ${percent}%`);
    },
    (error) => {
      console.error(`❌ Error cargando modelo para ${data.name}:`, error);
      createFallbackEnemy(scene, data, index);
    }
  );
}

function createEnemyFromGLB(scene, gltfScene, data, index) {
  // Configurar el modelo GLB
  gltfScene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      if (child.material) {
        child.material.metalness = 0.3;
        child.material.roughness = 0.7;
      }
    }
  });

  // Crear contenedor principal
  const enemyContainer = new THREE.Group();
  enemyContainer.position.copy(data.position);
  
  // 1. Crear hitbox invisible
  const hitbox = createHitbox();
  hitbox.position.y = 1;
  enemyContainer.add(hitbox);
  
  // 2. Añadir modelo GLB (único para este enemigo)
  const enemyVisual = gltfScene;
  enemyVisual.position.set(0, 0, 0);
  enemyVisual.scale.set(data.scale, data.scale, data.scale);
  enemyContainer.add(enemyVisual);

  // 3. Añadir etiqueta
  const label = createLabel(data.name);
  label.position.set(0, 3, 0);
  enemyContainer.add(label);

  // === CONFIGURACIÓN DE DATOS ===
  // Configurar en la hitbox para detección
  hitbox.userData.health = 100;
  hitbox.userData.name = data.name;
  hitbox.userData.isEnemy = true;
  hitbox.userData.isDead = false;
  hitbox.userData.container = enemyContainer;
  hitbox.userData.visualModel = enemyVisual;
  
  // Guardar materiales originales (únicos para este enemigo)
  hitbox.userData.originalMaterials = [];
  enemyVisual.traverse((child) => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        hitbox.userData.originalMaterials.push(...child.material.map(mat => mat.clone()));
      } else {
        hitbox.userData.originalMaterials.push(child.material.clone());
      }
    }
  });

  // Configurar en el contenedor para animación
  enemyContainer.userData.hitbox = hitbox;
  enemyContainer.userData.visualModel = enemyVisual;
  enemyContainer.userData.label = label;
  enemyContainer.userData.floatOffset = Math.random() * Math.PI * 2;
  enemyContainer.userData.floatSpeed = 0.5 + Math.random() * 0.5;

  scene.add(enemyContainer);
  
  // Añadir la HITBOX al array de enemigos
  enemies.push(hitbox);
  
  console.log(`👾 Enemigo creado: ${data.name}`);
  
  // Actualizar referencia global cuando todos estén cargados
  if (enemies.length === 3) {
    window.enemies = enemies;
    console.log(`🎯 Todos los enemigos cargados: ${enemies.length}`);
  }
}

function createHitbox() {
  const hitboxGeometry = new THREE.BoxGeometry(1.5, 2, 1.5);
  const hitboxMaterial = new THREE.MeshBasicMaterial({ 
    visible: false,
    wireframe: false
  });
  const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
  
  hitbox.raycast = THREE.Mesh.prototype.raycast;
  
  return hitbox;
}

function createLabel(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 64;

  canvas.width = 512;
  canvas.height = 128;

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true,
    depthTest: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4, 1, 1);
  return sprite;
}

function createFallbackEnemy(scene, data, index) {
  console.log(`🔄 Creando enemigo de fallback para ${data.name}`);
  
  const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
  const enemyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff4444,
    metalness: 0.3,
    roughness: 0.7
  });

  const enemyContainer = new THREE.Group();
  enemyContainer.position.copy(data.position);
  
  const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial.clone());
  enemy.position.set(0, 0, 0);
  enemy.castShadow = true;
  enemy.receiveShadow = true;
  enemyContainer.add(enemy);
  
  // Configurar datos
  enemyContainer.userData.health = 100;
  enemyContainer.userData.name = data.name;
  enemyContainer.userData.isEnemy = true;
  enemyContainer.userData.isDead = false;
  enemyContainer.userData.hitbox = enemy;
  enemyContainer.userData.visualModel = enemy;
  enemyContainer.userData.originalMaterials = [enemyMaterial.clone()];

  // Animación flotante
  enemyContainer.userData.floatOffset = Math.random() * Math.PI * 2;
  enemyContainer.userData.floatSpeed = 0.5 + Math.random() * 0.5;

  // Etiqueta flotante
  const label = createLabel(data.name);
  label.position.set(0, 1.5, 0);
  enemyContainer.add(label);
  enemyContainer.userData.label = label;

  scene.add(enemyContainer);
  enemies.push(enemy);
  
  console.log(`👾 Enemigo de fallback creado: ${data.name}`);
  
  // Actualizar referencia global
  window.enemies = enemies;
}

export function updateEntities(delta, scene, camera) {
  // Actualizar animaciones de todos los contenedores
  scene.children.forEach(child => {
    if (child.isGroup && child.userData.floatOffset !== undefined) {
      // Animación flotante
      child.position.y += Math.sin(child.userData.floatOffset + Date.now() * 0.001 * child.userData.floatSpeed) * 0.002;
      
      // Rotar etiquetas hacia la cámara
      if (child.userData.label && camera) {
        child.userData.label.lookAt(camera.position);
      }
    }
  });

  // Actualizar lógica de enemigos
  enemies.forEach((hitbox) => {
    const enemyContainer = hitbox.userData.container || hitbox.parent;
    
    // Verificar que el enemigo aún exista en la escena
    if (!enemyContainer || !scene.children.includes(enemyContainer)) {
      return;
    }

    // Sincronizar salud entre hitbox y contenedor
    if (enemyContainer.userData) {
      enemyContainer.userData.health = hitbox.userData.health;
    }

    // Si el enemigo muere → desbloquear proyecto
    if (hitbox.userData.health <= 0 && !hitbox.userData.unlocked) {
      hitbox.userData.unlocked = true;
      hitbox.userData.isDead = true;
      unlockProject(hitbox.userData.name);
      console.log(`🎯 Proyecto desbloqueado: ${hitbox.userData.name}`);
    }

    // Fade out visual cuando el enemigo muere
    if (hitbox.userData.health <= 0) {
      const visualModel = hitbox.userData.visualModel;
      
      if (visualModel) {
        // Aplicar fade out al modelo visual
        visualModel.traverse((child) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = true;
                mat.opacity = Math.max(0, mat.opacity - delta * 2);
              });
            } else {
              child.material.transparent = true;
              child.material.opacity = Math.max(0, child.material.opacity - delta * 2);
            }
          }
        });
      }

      // Fade out de la etiqueta
      if (enemyContainer.userData.label && enemyContainer.userData.label.material) {
        enemyContainer.userData.label.material.opacity = Math.max(0, enemyContainer.userData.label.material.opacity - delta * 2);
      }

      // Determinar cuándo remover
      let shouldRemove = false;
      
      if (visualModel) {
        // Buscar el primer mesh para verificar opacidad
        let foundOpaque = false;
        visualModel.traverse(child => {
          if (child.isMesh && child.material && !foundOpaque) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            foundOpaque = materials.some(mat => mat.opacity > 0);
          }
        });
        shouldRemove = !foundOpaque;
      } else {
        shouldRemove = true;
      }

      // Remover cuando esté completamente transparente
      if (shouldRemove) {
        if (scene.children.includes(enemyContainer)) {
          scene.remove(enemyContainer);
          console.log(`🗑️ Enemigo ${hitbox.userData.name} removido de la escena`);
        }
      }
    }
  });

  // Filtrar el array para mantener solo los enemigos que están en la escena
  enemies = enemies.filter((hitbox) => {
    const enemyContainer = hitbox.userData.container || hitbox.parent;
    return enemyContainer && scene.children.includes(enemyContainer);
  });
  
  // Actualizar la referencia global
  window.enemies = enemies;
}