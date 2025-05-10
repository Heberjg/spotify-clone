
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
        if (now - lastClick < 500) return; // Throttle de 500ms
        lastClick = now;
        handleSongChange(button, "sidebar").catch(console.error);
      });
    });
  };
  
  // Actualización del botón de play/pause
  const updatePlayButton = () => {
    console.log("2")
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
  const setupAudioEvents = async () => {
    if (!Audio) return;

    ['play', 'pause', 'ended'].forEach(event => {
      Audio.addEventListener(event, () => {
        playerStore.setState({ 
          isPlaying: event === 'play' 
        });
        console.log("Activado")
      });
    });
  };

  const VolumenSet = () => {  
    let isDragging = false;
    const { volumen } = playerStore.getState();  
    const slider = document.getElementById('Container-Range');
    const input = document.querySelector('input[type="range"]');
    
    if (!slider || !input || !Audio) {
      console.error('Elementos esenciales no encontrados');
      return;
    }
    
    let initialVolume = volumen ;
    initialVolume = Audio.volume;
    input.value = initialVolume.toString();

    let volumeControl = null
    input.addEventListener('input', (e) => {
      const volume = parseFloat(input.value);
      Audio.volume = volume;
      Audio.muted = false;
      
      // Actualización del estado y UI
      volumeControl = volume

      const progressElement = document.querySelector('.progress');
      progressElement.style.setProperty('--progress', `${volume * 100}%`);
      input.setAttribute("value", Audio.volume)
      VolumenIcon(volume)
      
    });
    
  
      // Evento cuando se presiona el mouse (inicio del arrastre)
      slider.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateVolumeOnDrag(e); 
      });

      // Evento cuando se mueve el mouse (durante el arrastre)
      slider.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updateVolumeOnDrag(e);
      });

      document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        playerStore.setState({ volumen: input.value });
        }
    });

    // Esto captura si el mouse sale del slider durante arrastre
      slider.addEventListener('mouseleave', () => {
          if (isDragging) {
              isDragging = false;
              playerStore.setState({ volumen: input.value });
          }
    });

      // Función para actualizar el volumen durante el arrastre
      function updateVolumeOnDrag(e) {
        const rect = slider.getBoundingClientRect();
        const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        input.value = percent;
        input.dispatchEvent(new Event('input'));
        
        e.preventDefault();
      }
};

  const VolumenIcon = (volume) => {
    const volumeIcons = {
      high : {
        paths: [
          "M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z",
          "M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z",
        ],
        label: "VolumenActivado" 
      },
      muted: {
        paths: [
          "M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z",
          "M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z"
        ],
        label: "VolumenApagado"
      } 
    }

    const svg = document.getElementById('volume-icon');
    const iconType = volume === 0 ? 'muted' : 'high';
    const icon = volumeIcons[iconType];
    
    // Actualizar atributos
    svg.setAttribute('aria-label', icon.label);
    
    // Actualizar paths
    const paths = svg.querySelectorAll('path');
    icon.paths.forEach((d, i) => {
      if (paths[i]) {
        paths[i].setAttribute('d', d);
      }
    });
  }

  const BarDuration = () => {
     const { duration, currentAudio, isPlaying } = playerStore.getState();
      const CurrentSongDuration = document.getElementById("Current-Song-Duration")
      const SongDuration = document.getElementById("Song-Duration")
      const BarSongDuration = document.getElementById("Bar-Song-Duration")
      const inputDuration = BarSongDuration.querySelector("label > input")
      const progressDuration = document.querySelector(".progress-Duration")

      console.log("a")

 if (!currentAudio || !duration) return;

  // Función para formatear tiempo (mm:ss)
  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Inicializar valores
  SongDuration.textContent = formatTime(duration);
  CurrentSongDuration.textContent = formatTime(currentAudio.currentTime);
  inputDuration.max = duration;
  inputDuration.value = currentAudio.currentTime;

  // Actualizar barra de progreso visual
  const updateProgressBar = () => {
    const progressPercent = (currentAudio.currentTime / duration) * 100;
    progressDuration.style.width = `${progressPercent}%`;
    inputDuration.value = currentAudio.currentTime;
    CurrentSongDuration.textContent = formatTime(currentAudio.currentTime);
  };

  // Loop de actualización durante reproducción
  let animationFrameId;
  const updateProgress = () => {
    updateProgressBar();
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateProgress);
    }
  };

  // Iniciar/Detener actualización
  if (isPlaying) {
    updateProgress();
  }

  // Eventos de interacción
  let isDragging = false;

  inputDuration.addEventListener('input', () => {
    if (!isDragging) {
      currentAudio.currentTime = inputDuration.value;
      updateProgressBar();
    }
  });

  inputDuration.addEventListener('input', () => {
    const newTime = parseFloat(inputDuration.value);
    currentAudio.currentTime = newTime;
    CurrentSongDuration.textContent = formatTime(newTime);
    progressDuration.style.width = `${(newTime / duration) * 100}%`;
    
    if (!isDragging) {
      currentAudio.currentTime = newTime;
      if (isPlaying) {
        currentAudio.play().catch(e => console.error("Error al reanudar:", e));
      }
    }
  });

  inputDuration.addEventListener('mousedown', () => {
    isDragging = true;
    cancelAnimationFrame(animationFrameId);
  });
  

  inputDuration.addEventListener('mouseup', () => {
    isDragging = false;
    currentAudio.currentTime = parseFloat(inputDuration.value);
    if (isPlaying) {
      currentAudio.play().catch(e => console.error("Error al reanudar:", e));
      updateProgress();
    }
  });

  // Limpieza al desmontar (si usas framework)
  return () => {
    cancelAnimationFrame(animationFrameId);
  };
};


  


    // Restaurar estado si hay una canción guardada
    const initialize =  async() => {
      const { currentSongId, volumen, isPlaying, currentAudio, Restore} = playerStore.getState();
      
      playerStore.setState({ 
        currentAudio: Audio,

      });
      
      // setupAudioEvents()
      setupButtons();
      VolumenSet()
      VolumenIcon(Audio.volume)
      
      
      
      // Restaurar estado
  
      try {
        if (currentSongId) {
          const song = songs.find(s => s.id === currentSongId);
          if (!song?.Audio) throw new Error('Canción no tiene audio');
          
          const progressElement = document.querySelector('.progress');
          progressElement.style.setProperty('--progress', `${volumen * 100}%`);
          

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
      playerStore.subscribe(updatePlayButton);
      playerStore.subscribe(BarDuration);
    };
    const unsubscribe = initialize();
    return () => unsubscribe();
  
}
