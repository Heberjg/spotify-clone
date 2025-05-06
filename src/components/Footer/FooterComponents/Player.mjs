
import { songs } from "../../../assets/Songs.mjs";
import { playerStore } from "../../../store/playerStore.mjs";

export const handleSongChange = async (button, location) => {
  const songId = button.getAttribute("data-id");
  await playerStore.playSong(songId, location);
};

export async function Player() {
  const AudioPlayButton = document.getElementById("Audio-Play");
  const Audio = document.getElementById("Audio");
  
  
  // Función para manejar play/pause en todos los butones
const setupButtons = () => {
    AudioPlayButton?.addEventListener("click", async () => {
      const { currentSongId } = playerStore.getState()
      try {
        if (!currentSongId && songs.length > 0) {
          // Si no hay canción seleccionada, reproducir la primera
          await playerStore.playSong(songs[0].id, 'main');
        } else {
          // Si hay canción seleccionada, usar togglePlay
          await playerStore.togglePlay();
        }
      } catch (error) {
        console.error("Error al reproducir:", error);
      }
    });

    // Botones del SIDEBAR
    let lastClick = 0;
    document.querySelectorAll(".Song-button-aside").forEach(button => {
      button.addEventListener("click", () => {
        const now = Date.now();
        if (now - lastClick < 300) return; // Throttle de 500ms
        lastClick = now;
        handleSongChange(button, "sidebar").catch(console.error);
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

    

  // Actualizar botones del SIDEBAR (independientes)
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
  
    // 1. Manejadores básicos
    const handlePlay = () => playerStore.setState({ isPlaying: true });
    const handlePause = () => playerStore.setState({ isPlaying: false });
    const handleEnded = () => playerStore.setState({ isPlaying: false });
  
    // 2. Sistema avanzado de buffering
    const updateBufferState = () => {
      if (!Audio.buffered.length) return;
      
      const bufferedEnd = Audio.buffered.end(Audio.buffered.length - 1);
      const percentage = Audio.duration ? (bufferedEnd / Audio.duration) * 100 : 0;
      
      playerStore.setState({
        buffering: {
          buffered: bufferedEnd,
          percentage,
          isBuffering: false
        }
      });
    };
  
    const handleWaiting = () => {
      playerStore.setState({
        buffering: {
          ...currentState.buffering,
          isBuffering: true
        }
      });
      
      // Inteligencia para reanudar automáticamente
      const checkBufferAndPlay = () => {
        if (Audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
          Audio.play().catch(e => console.log("Reanudación automática:", e));
        } else {
          setTimeout(checkBufferAndPlay, 500);
        }
      };
      checkBufferAndPlay();
    };
  
    // 3. Configurar todos los listeners
    const events = {
      play: handlePlay,
      pause: handlePause,
      ended: handleEnded,
      progress: updateBufferState,
      waiting: handleWaiting,
      canplay: () => playerStore.setState({
        buffering: {
          isBuffering: false
        }
      }),
      error: () => playerStore.setState({ 
        isPlaying: false,
        buffering: {
          isBuffering: false,
          percentage: 0,
          buffered: 0
        }
      })
    };
  
    Object.entries(events).forEach(([event, handler]) => {
      Audio.addEventListener(event, handler);
    });
  
    // 4. Función de limpieza
    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        Audio.removeEventListener(event, handler);
      });
    };
  };

    // Restaurar estado si hay una canción guardada
    const initialize =  async() => {
      playerStore.setState({ currentAudio: Audio });
      setupAudioEvents();
      Audio.preload = 'metadatos';
      setupButtons();
      
      
      // Restaurar estado
      const { currentSongId } = playerStore.getState();
      try {
        if (currentSongId) {
          const song = songs.find(s => s.id === currentSongId);
          if (!song?.Audio) throw new Error('Canción no tiene audio');
          
          // Solo actualiza el audio si es diferente al actual
          if (Audio.src !== song.Audio || Audio.dataset.id !== currentSongId) {
            Audio.src = song.Audio;
            Audio.dataset.id = song.id;
          }
        }
      } catch (error) {
        console.error("Error al inicializar:", error);
        playerStore.setState({ 
          isPlaying: false,
          currentSongId: null
        });
      }
      return playerStore.subscribe(updatePlayButton);
    };
  
    const unsubscribe = initialize();
    return () => unsubscribe();
  
}
