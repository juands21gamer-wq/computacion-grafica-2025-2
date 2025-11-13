// ui.js
export function initUI() {
    // Crear contenedor principal
    const ui = document.createElement('div');
    ui.id = 'ui';
    ui.style.position = 'absolute';
    ui.style.top = '20px';
    ui.style.left = '20px';
    ui.style.color = 'white';
    ui.style.fontFamily = 'Arial';
    ui.style.zIndex = '10';
    document.body.appendChild(ui);

    // Asegurar que el unlockPopup y overlay existan usando la función global
    if (window.ensureUnlockPopup) {
        window.ensureUnlockPopup();
    } else {
        // Fallback si la función global no está disponible
        const overlay = document.createElement('div');
        overlay.id = 'popupOverlay';
        overlay.className = 'popup-overlay';
        document.body.appendChild(overlay);
        
        const unlockPopup = document.createElement('div');
        unlockPopup.id = 'unlockPopup';
        unlockPopup.className = 'unlock-popup';
        document.body.appendChild(unlockPopup);
    }
}

export function updateUI() {
    // Aquí puedes actualizar HUD, vida, etc más adelante
}

// Función para cerrar el popup
function closePopup() {
    const popup = document.getElementById('unlockPopup');
    const overlay = document.getElementById('popupOverlay');
    
    if (popup) {
        popup.classList.remove('show');
    }
    
    if (overlay) {
        overlay.classList.remove('active');
    }
    
    // Volver a bloquear mouse cuando se cierra el popup
    if (window.lockMouse && window.gameStarted) {
        setTimeout(() => {
            window.lockMouse();
        }, 100);
    }
}

export function unlockProject(projectName) {
    // Usar la función global para asegurar que el popup existe
    if (window.ensureUnlockPopup) {
        window.ensureUnlockPopup();
    }
    
    const popup = document.getElementById('unlockPopup');
    const overlay = document.getElementById('popupOverlay');
    
    if (!popup || !overlay) {
        console.error('❌ unlockPopup o popupOverlay no encontrado');
        return;
    }

    // Desbloquear mouse cuando aparece el popup
    if (window.unlockMouse) {
        window.unlockMouse();
    }

    // Info personalizada por proyecto
    const projectInfo = {
        "proyecto de modelado 3d": {
            desc: "modelado 3d usando magic voxel.",
            link: "https://juands21gamer-wq.github.io/computacion-grafica-2025-2/trabajoviewerde3modelos/index.html",
            image: "./models/textures/paisaje.png"
        },
        "skills: ": {
            desc: "estos son los programas y herramientas que manejo.",
            link: "https://juands21gamer-wq.github.io/computacion-grafica-2025-2/Mesa%20de%20trabajo%201%20copia.pdf", 
            image: "./models/textures/programas.png"
        },
        "HOJA DE VIDA": {
            desc: "soy juan david solano martinez, estudiante de ingenieria multimedia de 4 semestre ",
            link: "https://juands21gamer-wq.github.io/computacion-grafica-2025-2/CVjuan.pdf",
            image: "./models/textures/CVjuan.jpg"
        },
        "MERITOS": {
            desc: "graduado del colegio claret",
            link: "https://juands21gamer-wq.github.io/computacion-grafica-2025-2/CVjuan.pdf",
            image: "./models/textures/claret.jpeg"
        },
        "proyecto audiovisual": {
            desc: "un proyecto audiovisual realizado en equipo para guion.",
            link: "https://www.youtube.com/watch?v=hhlaZtVgwA4",
            image: "./models/textures/lavida.png"
        }
    }; 

    const info = projectInfo[projectName] || { 
        desc: "Proyecto misterioso", 
        link: "#", 
        image: "https://via.placeholder.com/400x200/333/fff?text=Misterioso" 
    };

    // Contenido del popup con solo la X de cierre (sin botón "Cerrar")
    popup.innerHTML = `
        <button class="popup-close-button" id="popupCloseButton">X</button>
        <h2>${projectName}</h2>
        <img src="${info.image}" alt="${projectName}">
        <p>${info.desc}</p>
        <a href="${info.link}" target="_blank">Ver proyecto</a>
    `;

    // Mostrar overlay y popup
    overlay.classList.add('active');
    popup.classList.add('show');
    console.log(`✅ Popup mostrado: ${projectName}`);

    // Agregar event listener para el botón de cierre
    const closeButton = document.getElementById('popupCloseButton');
    
    if (closeButton) {
        closeButton.addEventListener('click', closePopup);
    }
    
    // También cerrar al hacer clic en el overlay
    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            closePopup();
        }
    });

    // ❌ ELIMINADO: El timeout de cierre automático a los 5 segundos
    // Ahora el popup permanecerá abierto hasta que el usuario lo cierre manualmente
}