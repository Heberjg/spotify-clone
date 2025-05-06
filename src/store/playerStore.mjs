
let currentState = JSON.parse(sessionStorage.getItem('music-player-storage')) || {
      currentSongId: null,
      isPlaying: false,
      currentLocation: null,
      currentAudio: null,
      currentSongData: null,
      buffering: {
        buffered: 0,           // Tiempo en segundos bufferizado
        percentage: 0,         // Porcentaje cargado (0-100)
        isBuffering: false,    // Si está cargando actualmente
      }
    }
  

import { songs } from "../assets/Songs.mjs"

const subscribers = new Set();

export const playerStore = {
  getState: () => currentState,
  
  setState: (newState) => {
    currentState = { ...currentState, ...newState };
    sessionStorage.setItem('music-player-storage', 
      JSON.stringify({
        currentSongId: currentState.currentSongId,
        currentLocation: currentState.currentLocation,
        currentSongData: currentState.currentSongData,
        // isplaying no se guarda para evitar la reproduccion automatica al recargar, solucion simple
      })
    );
    subscribers.forEach(cb => cb(currentState));
  },

  subscribe: (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },
  
  playSong: async (songId, location) => {
    try {
      const { currentSongId, isPlaying, currentAudio, currentLocation } = currentState;
      const song = songs.find(s => s.id === songId);
      const isSameSong = currentSongId === songId;
      const isSameLocation = currentLocation === location
      
      // Validación inicial
      if (!song?.Audio) throw new Error('Canción no disponible');
  
      // Caso 1: Misma canción y misma ubicación (toggle play/pause)
      if (isSameLocation && isSameSong) {
        if (isPlaying) {
          await currentAudio.pause();
          playerStore.setState({ isPlaying: false });
        } else {
          await currentAudio.play();
          playerStore.setState({ isPlaying: true });
        }
        return;
      }
  
      // Caso 2: Nueva canción o diferente ubicación
        const audioElement = currentAudio || new Audio();
        
        // Configuración del audio
        audioElement.src = song.Audio;
        audioElement.dataset.id = songId;
        audioElement.preload = 'auto';

        playerStore.setState({
          currentSongData: {
            name: song.Name,
            artist: song.Artist,
            image: song.img
          },
        })
      // Precargar el audio antes de cualquier cambio de estado
      
  
      // Actualizar estado y reproducir
      await playerStore.setState({
        currentSongId: songId,
        isPlaying: false,
        currentLocation: location,
        currentAudio: audioElement,
        buffering: {
          buffered: 0,
          percentage: 0,
          isBuffering: true,
        }
      });
  
      // Iniciar carga (la reproducción la controlará setupAudioEvents)
      // Esperar a que haya metadata disponible
    await new Promise((resolve) => {
      audioElement.addEventListener('loadedmetadata', resolve, { once: true });
      audioElement.load();
    });

    // Intentar reproducción inmediata si hay suficiente buffer
    if (audioElement.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      await audioElement.play();
      playerStore.setState({ isPlaying: true });
    } else {
      // Si no hay suficiente buffer, setupAudioEvents manejará la reproducción después
      audioElement.addEventListener('canplay', () => {
        if (currentState.currentSongId === songId && !currentState.isPlaying) {
          audioElement.play().catch(e => console.log("Auto-play prevented:", e));
        }
      }, { once: true });
    }
  
    } catch (error) {
      console.error("Error en playSong:", error);
      playerStore.setState({ 
        isPlaying: false,
        currentAudio: null,
        buffering: {
          buffered: 0,
          percentage: 0,
          isBuffering: false,
          lastUpdated: Date.now()
        }
      });
      throw error; // Opcional: re-lanzar el error para manejo externo
    }
  },
  

  // Change stated of the button from pause to play and backwards
  togglePlay: async () => {
    const { isPlaying, currentAudio} = currentState;
    // Control normal de play/pause
    if (isPlaying) {
      await currentAudio.pause();
      playerStore.setState({ isPlaying: false });
    } else {
      await currentAudio.play();
      playerStore.setState({ isPlaying: true });
    }
  }
};
