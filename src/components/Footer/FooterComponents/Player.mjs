
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


    ['play', 'pause', 'ended'].forEach(event => {
      Audio.addEventListener(event, () => {
        playerStore.setState({ 
          isPlaying: event === 'play' 
        });
      });
    });

    const handleProgress = () => {
      if (!Audio?.buffered.length || Audio.readyState === 0) return;
      
      try {
        const bufferedEnd = Audio.buffered.end(Audio.buffered.length - 1);
        playerStore.setState({
          buffering: {
            buffered: bufferedEnd,
            percentage: Audio.duration ? (bufferedEnd / Audio.duration) * 100 : 0,
            isBuffering: Audio.readyState < 3,
            lastUpdated: Date.now()
          }
        });
      } catch (error) {
        console.error('Error updating buffering:', error);
        playerStore.setState({
          buffering: {
            ...currentState.buffering,
            isBuffering: false,
            lastUpdated: Date.now()
          }
        });
      }
    };
  
    const handleError = () => {
      playerStore.setState({ isPlaying: false });
    };
  
    // Agregar todos los event listeners
    Audio.addEventListener('progress', handleProgress);
    Audio.addEventListener('error', handleError);
    // [Agrega otros event listeners que necesites]
  
    // Retornar función de limpieza
    return () => {
      Audio.removeEventListener('progress', handleProgress);
      Audio.removeEventListener('error', handleError);
      // [Remover otros event listeners que hayas agregado]
    };
  };

    // Restaurar estado si hay una canción guardada
    const initialize =  async() => {
      playerStore.setState({ currentAudio: Audio });
      setupAudioEvents();
      Audio.preload = 'auto';
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
            await new Promise((resolve) => {
              Audio.addEventListener('canplaythrough', resolve, { once: true });
              Audio.load();
            });
          }
        }
      } catch (error) {
        console.error("Error al inicializar:", error);
        playerStore.setState({ 
          isPlaying: false,
          currentSongId: null
        });
      }
      updatePlayButton();
      return playerStore.subscribe(updatePlayButton);
    };
  
    const unsubscribe = initialize();
    return () => unsubscribe();
  
}
