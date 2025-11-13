export class AudioPlayer {
    constructor() {
        this.backgroundMusic = null;
        this.isPlaying = false;
    }

    init() {
        // Crear el elemento de audio
        this.backgroundMusic = new Audio('./src/audio/music.wav');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.2;
        
        console.log("✅ Audio inicializado");
    }

    play() {
        if (this.backgroundMusic && !this.isPlaying) {
            this.backgroundMusic.play().then(() => {
                this.isPlaying = true;
                console.log("🎵 Música iniciada");
            }).catch(error => {
                console.log("❌ Click para iniciar música:", error);
            });
        }
    }

    pause() {
        if (this.backgroundMusic && this.isPlaying) {
            this.backgroundMusic.pause();
            this.isPlaying = false;
            console.log("⏸️ Música pausada");
        }
    }

    setVolume(volume) {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = volume;
        }
    }
}

export const audioPlayer = new AudioPlayer();