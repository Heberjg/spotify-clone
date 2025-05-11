
import { songs } from "../../../assets/Songs.mjs";
import { playerStore } from "../../../store/playerStore.mjs";
import placeholderImage from "../../../assets/background.svg";
export const ICONS = {
  PLAY: "M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z",
  PAUSE: "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"
};


export const ImageUpdate = () => {
  const { currentSongData, currentSongId, currentAudio } = playerStore.getState();
  const songImage = document.getElementById('song-image');
  const imageSource = document.getElementById('dynamic-image-source');
  const songTitle = document.getElementById('song-title');
  const songArtist = document.getElementById('song-artist');
  
 // Valores por defecto si no hay datos
  if (!currentSongData) {
    imageSource.srcset = placeholderImage.src; 
    songImage.alt = 'Selecciona una canción';
    songTitle.textContent = '';
    songArtist.textContent = '';
    return;
  }
  // Nuevos datos de la canción
  const newImageUrl = currentSongData?.image?.src || '';
  const prevImageUrl = imageSource.srcset;

  // Precargar imagen para evitar flashes
  const preloadImage = new Image();
  preloadImage.src = newImageUrl;

  // Actualizar solo si hay cambios
  if (newImageUrl !== prevImageUrl) {
    imageSource.srcset = newImageUrl;
    songImage.alt = `Portada de ${currentSongData?.name || 'Canción'}`;
    songTitle.textContent = currentSongData.name || '';
    songArtist.textContent = currentSongData.artist || '';
  }
  
};

export const updateButtonUI = (button, isActive) => {
  const iconPath = button.querySelector("svg > path");
  if (!iconPath) return;
  iconPath.setAttribute("d", isActive ? ICONS.PAUSE : ICONS.PLAY);
  button.setAttribute("aria-label", isActive ? "Pausar" : "Reproducir");

};

export const handleSongChange = async (button, location) => {
  const songId = button.getAttribute("data-id");
  await playerStore.playSong(songId, location);
};

export const setupButtonListener = (button, location) => {
  let lastClick = 0;
  button.addEventListener("click", async () => {
    const now = Date.now();
    if (now - lastClick < 500) return;
    lastClick = now;
    await handleSongChange(button, location);
  });
};

let Init = false
export const initMainButtons = () => {
  if (Init) {
    updatePlayButton()
    Init = false
    return;
  }
  // Configurar listeners una sola vez
  document.querySelectorAll(".Play-button").forEach(button => {
    setupButtonListener(button, "main");

  });
 
  // Actualizar estado inicial
  Init = true
  updatePlayButton();
};

// Actualización del botón de play/pause
  const updatePlayButton = () => {
    const AudioPlayButton = document.getElementById("Audio-Play");
    
    const { currentSongId, isPlaying, currentLocation } = playerStore.getState();
    //Boton principal)
    if (AudioPlayButton) {
      const iconPath = AudioPlayButton.querySelector("span > svg > path");
      if (iconPath) {
        iconPath.setAttribute("d", isPlaying ? ICONS.PAUSE : ICONS.PLAY);
        AudioPlayButton.setAttribute("aria-label", isPlaying ? "Pausar" : "Reproducir");
      }
    }

   const allButtons = [...document.querySelectorAll(".Play-button, .Song-button-aside")];
  
  allButtons.forEach(button => {
    const songId = button.getAttribute("data-id");
    const buttonLocation = button.classList.contains("Play-button") ? "main" : "sidebar";
    const isActive = currentSongId === songId && isPlaying && currentLocation === buttonLocation;
    const iconPath = button.querySelector("svg > path");
    if (!iconPath) return;
    
    // Solo actualizar si el estado cambió
    const currentIcon = iconPath.getAttribute("d");
    const shouldBeIcon = isActive ? ICONS.PAUSE : ICONS.PLAY;
    
    if (currentIcon !== shouldBeIcon) {
      iconPath.setAttribute("d", shouldBeIcon);
      button.setAttribute("aria-label", isActive ? "Pausar" : "Reproducir");
    }
  });
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
    document.querySelectorAll(".Song-button-aside").forEach(button => {
      setupButtonListener(button, "sidebar");
    });
  };
  
  // Eventos del reproductor
  const setupAudioEvents = async () => {
    if (!Audio) return;

    ['play', 'pause', 'ended'].forEach(event => {
      Audio.addEventListener(event, () => {
        playerStore.setState({ 
          isPlaying: event === 'play' 
        });
        updatePlayButton()
      });
    });
  };

  const VolumenSet = () => {  
    let isDragging = false;
    const { volumen } = playerStore.getState();  
    const slider = document.getElementById('Container-Range');
    const input = document.getElementById("input-volumen")
    if (!slider || !input || !Audio) {
      console.error('Elementos esenciales no encontrados');
      return;
    }
    
    let initialVolume = volumen ;
    VolumenIcon(initialVolume)
    Audio.volume = initialVolume;
    input.value = initialVolume.toString();

    let volumeControl = null;
    input.addEventListener('input', () => {
      const volume = parseFloat(input.value);
      Audio.volume = volume;
      Audio.muted = false;
      // Actualización del estado y UI
      volumeControl = volume

      const progressElement = document.querySelector('.progress');
      progressElement.style.setProperty('--progress', `${volume * 100}%`);
      input.setAttribute("value", Audio.volume)

      if (volume <= 0.01 ) {
        VolumenIcon(volume)
      }
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
        playerStore.setState({ volumen: volumeControl})
        }
    });

    // Esto captura si el mouse sale del slider durante arrastre
      slider.addEventListener('mouseleave', () => {
          if (isDragging) {
              isDragging = false;
              playerStore.setState({ volumen: volumeControl})
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
  const { currentAudio, currentTime, duration, currentSongId} = playerStore.getState();
  const CurrentSongDuration = document.getElementById("Current-Song-Duration");
  const SongDuration = document.getElementById("Song-Duration");
  const RangeDuration = document.getElementById("Range-Duration");
  const InputBar = document.getElementById("Input-bar");
  const ProgressDuration = document.querySelector(".progress-Duration");
  

  let shouldUpdateStore = true;
  let isDragging = false;
  let previewTime = 0;


  // Función para formatear tiempo (mm:ss)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Función para sincronizar el audio con el estado guardado
  const syncAudioWithSavedState = () => {
    // Sincronizar el tiempo actual
    if (currentTime > 0 && currentAudio.currentTime !== currentTime) {
      currentAudio.currentTime = currentTime;
    }
  }
  // Actualizar UI basado directamente en el audio
   const updateProgressUI = (time = null) => {
    const effectiveTime = time !== null ? time : (currentAudio?.currentTime);
    const effectiveDuration = currentAudio?.duration || duration || 0;
    // Actualizar displays 
    if (CurrentSongDuration) {
      CurrentSongDuration.textContent = formatTime(effectiveTime);
    }
    if (SongDuration) {
      SongDuration.textContent = formatTime(effectiveDuration);
    }
    // Actualizar barra de progreso
    if (ProgressDuration) {
      const progressPercent = (effectiveTime / effectiveDuration) * 100;
      ProgressDuration.style.setProperty('--progress', `${progressPercent}%`);
    }

    // Actualizar input range
    if (InputBar) {
      InputBar.max = effectiveDuration;
      InputBar.value = effectiveTime;
    }
  };

  // Configurar eventos del audio
  if (currentAudio) {
    const onTimeUpdate = () => {
      if (!isDragging && shouldUpdateStore) {
        // Actualización UI (cada 900ms)
        if (!currentAudio._lastUIUpdate || Date.now() - currentAudio._lastUIUpdate > 500) {
          updateProgressUI();
          currentAudio._lastUIUpdate = Date.now();
        }
        
        // Actualización del store (cada 4000ms)
        if (!currentAudio._lastStoreUpdate || Date.now() - currentAudio._lastStoreUpdate > 4000) {
          playerStore.setState({ currentTime: currentAudio.currentTime });
          currentAudio._lastStoreUpdate = Date.now();
        }
      }
    }

    
    const onLoadedMetadata = () => {
        updateProgressUI();
        playerStore.setState({
        duration: currentAudio.duration,
      });
    };

    const onEnded = () => {
      playerStore.setState({ isPlaying: false});

    };

    // Limpiar eventos anteriores si existen
    currentAudio.removeEventListener('timeupdate', onTimeUpdate);
    currentAudio.removeEventListener('loadedmetadata', onLoadedMetadata);
    currentAudio.removeEventListener('ended', onEnded);

    // Asignar nuevos eventos
    currentAudio.addEventListener('timeupdate', onTimeUpdate);
    currentAudio.addEventListener('loadedmetadata', onLoadedMetadata);
    currentAudio.addEventListener('ended', onEnded);
  }
  // Interacción del usuario 
  if (RangeDuration) {

    const updateProgressOnDrag = (e) => {
      const rect = RangeDuration.getBoundingClientRect();
      const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const seekTime = percent * (currentAudio?.duration || 0);
      
      if (currentAudio) {
        currentAudio.currentTime = seekTime;
        shouldUpdateStore = true;
      }
    };

    // Evento cuando se presiona el mouse 
    RangeDuration.addEventListener('mousedown', (e) => {
      isDragging = true;
      shouldUpdateStore = false;
     const rect = RangeDuration.getBoundingClientRect();
      const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      previewTime = percent * (currentAudio?.duration || 0);
      updateProgressUI(previewTime)
    });

    // Evento cuando se mueve el mouse 
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const rect = RangeDuration.getBoundingClientRect();
      const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      previewTime = percent * (currentAudio?.duration || 0);
      updateProgressUI(previewTime)
    });

    // Evento cuando se suelta el mouse 
    document.addEventListener('mouseup', (e) => {
      if (isDragging) {
        isDragging = false;
        updateProgressOnDrag(e);
        
        if (currentAudio) {
          playerStore.setState({ currentTime: currentAudio.currentTime });
        }
      }
    });


    RangeDuration.addEventListener('mouseleave', (e) => {
      if (isDragging) {
        updateProgressUI()
        shouldUpdateStore = true;
        isDragging = false;
        if (currentAudio) {
          playerStore.setState({ currentTime: currentAudio.currentTime });
        }
      }
      
    });
    // Click directo en la barra
    RangeDuration.addEventListener('click', updateProgressOnDrag);
  }

  syncAudioWithSavedState();
};


    // Restaurar estado si hay una canción guardada
    const initialize =  async() => {
      playerStore.setState({ 
        currentAudio: Audio,
      });
      ImageUpdate()
      setupAudioEvents()
      BarDuration()
      setupButtons();
      VolumenSet()
      console.log("Initialisz")

      const { currentSongId, volumen, isPlaying, currentAudio, currentTime, duration} = playerStore.getState();
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
    };
    const unsubscribe = initialize();
    return () => unsubscribe();
  
}

