// menu.js
// Variables globales
let gameStarted = false;
let gameInitialized = false;
let renderer = null;

// Hacer gameStarted global para que ui.js pueda acceder
window.gameStarted = gameStarted;

// Elementos del DOM
const menuScreen = document.getElementById('MenuScreen');
const gameScreen = document.getElementById('gameScreen');
const pauseScreen = document.getElementById('PauseScreen');
const playButton = document.getElementById('playButton');
const instructionsButton = document.getElementById('instructionsButton');
const creditsButton = document.getElementById('creditsButton');
const resumeButton = document.getElementById('resumeButton');
const menuButton = document.getElementById('menuButton');
const hud = document.getElementById('hud');
const crosshair = document.getElementById('crosshair');

// Funciones para controlar el mouse
window.lockMouse = function() {
    document.body.style.cursor = 'none';
    if (renderer && renderer.domElement) {
        renderer.domElement.style.cursor = 'none';
    }
};

window.unlockMouse = function() {
    document.body.style.cursor = 'default';
    if (renderer && renderer.domElement) {
        renderer.domElement.style.cursor = 'default';
    }
};

// Asegurar que el unlockPopup y overlay existan globalmente
window.ensureUnlockPopup = function() {
    // Crear overlay si no existe
    if (!document.getElementById('popupOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'popupOverlay';
        overlay.className = 'popup-overlay';
        document.body.appendChild(overlay);
    }
    
    // Crear popup si no existe
    if (!document.getElementById('unlockPopup')) {
        const unlockPopup = document.createElement('div');
        unlockPopup.id = 'unlockPopup';
        unlockPopup.className = 'unlock-popup';
        document.body.appendChild(unlockPopup);
        console.log('✅ unlockPopup creado globalmente');
    }
};

// Funciones de control de pantallas
function startGame() {
    menuScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    hud.style.display = 'block';
    crosshair.style.display = 'block';
    
    // Actualizar estado global
    gameStarted = true;
    window.gameStarted = true;
    
    // Bloquear mouse al iniciar juego
    window.lockMouse();
    
    // Asegurar que el unlockPopup exista antes de cargar el juego
    window.ensureUnlockPopup();
    
    if (!gameInitialized) {
        // Cargar el juego principal
        import('./main.js')
            .then(module => {
                console.log('Juego cargado correctamente');
                gameInitialized = true;
                gameStarted = true;
                window.gameStarted = true;
                
                // Guardar referencia al renderer
                if (module.renderer) {
                    renderer = module.renderer;
                    window.renderer = renderer;
                }
            })
            .catch(error => {
                console.error('Error al cargar el juego:', error);
                returnToMenu();
            });
    } else {
        gameStarted = true;
        window.gameStarted = true;
    }
}

function togglePause() {
    if (pauseScreen.style.display === 'none' || !pauseScreen.style.display) {
        pauseScreen.style.display = 'flex';
        gameStarted = false;
        window.gameStarted = false;
        window.unlockMouse(); // Desbloquear mouse en pausa
    } else {
        pauseScreen.style.display = 'none';
        gameStarted = true;
        window.gameStarted = true;
        window.lockMouse(); // Bloquear mouse al reanudar
    }
}

function showInstructions() {
    alert("INSTRUCCIONES:\n\n- Moverse: W, A, S, D\n- Mirar alrededor: Ratón\n- Interactuar: Click izquierdo\n- Pausa: ESC\n\nExplora el mundo para descubrir mis proyectos");
}

function showCredits() {
    alert("CRÉDITOS:\n\nJuan David Solano Martinez\nUsando Three.js\nMúsica y efectos: Libre de derechos");
}

function returnToMenu() {
    pauseScreen.style.display = 'none';
    gameScreen.style.display = 'none';
    menuScreen.style.display = 'flex';
    hud.style.display = 'none';
    crosshair.style.display = 'none';
    gameStarted = false;
    window.gameStarted = false;
    window.unlockMouse(); // Desbloquear mouse en menú
}

// Event listeners
playButton.addEventListener('click', startGame);
instructionsButton.addEventListener('click', showInstructions);
creditsButton.addEventListener('click', showCredits);
resumeButton.addEventListener('click', togglePause);
menuButton.addEventListener('click', returnToMenu);

// Manejar tecla ESC para pausa
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && gameStarted) {
        togglePause();
    }
});

// Efecto jittery para el título
document.addEventListener('DOMContentLoaded', function() {
    const jitteryElement = document.querySelector('.jittery');
    if (jitteryElement) {
        const text = jitteryElement.textContent;
        jitteryElement.innerHTML = '';
        
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.style.animationDelay = `${i * 70}ms`;
            jitteryElement.appendChild(span);
        }
    }
    
    // Crear el unlockPopup y overlay desde el inicio
    window.ensureUnlockPopup();
});