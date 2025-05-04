
import { songs } from "../../../assets/Songs.mjs";
import { playerStore } from "../../../store/playerStore.mjs";

export async function Player() {
  const AudioPlayButton = document.getElementById("Audio-Play");
  const Audio = document.getElementById("Audio");

  // Función para manejar play/pause en todos los butones
const setupButtons = () => {
    // Botón principal de play/pause
    AudioPlayButton?.addEventListener("click", () => {
      const { currentSongId } = playerStore.getState();
      if (!currentSongId && songs.length > 0) {
        playerStore.playSong(songs[0].id, 'main');
      } else {
        playerStore.togglePlay();
      }
    });

    // Botones del SIDEBAR
    document.querySelectorAll(".Song-button-aside").forEach(button => {
      button.addEventListener("click", () => {
        const songId = button.getAttribute("data-id");
        playerStore.playSong(songId, 'sidebar');
      });
    });
  };

  // Actualización del botón de play/pause
  const updatePlayButton = () => {
    const { currentSongId, isPlaying, currentLocation } = playerStore.getState();
    //Boton principal)
    if (AudioPlayButton) {
      const iconPath = AudioPlayButton.querySelector("span > svg > path");
      if (iconPath) {
        iconPath.setAttribute("d", isPlaying ? 
          "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z" : 
          "M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"
        );
        AudioPlayButton.setAttribute("aria-label", isPlaying ? "Pausar" : "Reproducir");
      }
    }

    

  // 3. Actualizar botones del SIDEBAR (independientes)
  const sidebarButtons = document.querySelectorAll(".Song-button-aside");
  sidebarButtons.forEach((button) => {
    const songId = button.getAttribute("data-id");
    const isCurrentSong = currentSongId === songId;
    const iconPath = button.querySelector("svg > path");
    
    if (iconPath) {
      if (isCurrentSong && isPlaying && currentLocation === 'sidebar') {
        iconPath.setAttribute("d", "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z");
        button.setAttribute("aria-label", "Pausar");
      } else {
        iconPath.setAttribute("d", "M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z");
        button.setAttribute("aria-label", "Reproducir");
      }
    }
  })
};

  // Eventos del reproductor
  const setupAudioEvents = () => {
    if (!Audio) return;
    
    ['play', 'pause', 'ended'].forEach(event => {
      Audio.addEventListener(event, () => {
        playerStore.setState({ 
          isPlaying: event === 'play' 
        });
      });
    });
  };

    // Restaurar estado si hay una canción guardada
    const initialize = () => {
      playerStore.setState({ currentAudio: Audio });
      setupAudioEvents();
      setupButtons();
      
      // Restaurar estado
      const { currentSongId, isPlaying, currentLocation } = playerStore.getState();
      if (currentSongId) {
        const song = songs.find(s => s.id === currentSongId);
        if (song?.Audio) {
          Audio.src = song.Audio;
          Audio.dataset.id = song.id;
          if (isPlaying && currentLocation) {
            Audio.play().catch(e => console.error("Error al reanudar:", e));
          }
        }
      }
      
      updatePlayButton();
      return playerStore.subscribe(updatePlayButton);
    };
  
    const unsubscribe = initialize();
    
    return () => unsubscribe();
  
}