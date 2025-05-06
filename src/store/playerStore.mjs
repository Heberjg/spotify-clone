
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
      audioElement.onprogress = () => {
        if (audioElement.buffered.length > 0) {
          const bufferedEnd = audioElement.buffered.end(audioElement.buffered.length - 1);
          const percent = (bufferedEnd / audioElement.duration) * 100;
          console.log(percent)
          playerStore.setState({
            buffering: {
              buffered: bufferedEnd,
              percentage: percent,
              isBuffering: false
            }
          });
  
          if (percent > 20 && audioElement.paused) {
            audioElement.play().catch(e => console.log("Auto-play:", e));
          }
        }
      };
  
      audioElement.onwaiting = () => {
        playerStore.setState({
          buffering: {
            ...currentState.buffering,
            isBuffering: true
          }
        });
      };
  
      // 2. Precargar metadata (sin esperar buffer completo)
      await new Promise((resolve) => {
        audioElement.addEventListener('loadedmetadata', resolve, { once: true });
        audioElement.load(); // Inicia la carga
      });
  
      // 3. Actualizar estado y reproducir
      playerStore.setState({
        currentSongId: songId,
        currentLocation: location,
        currentAudio: audioElement,
        isPlaying: true,
        buffering: {
          buffered: 0,
          percentage: 0,
          isBuffering: true
        }
      });
  
      // 4. Reproducir (se auto-pausará si no hay buffer suficiente)
      await audioElement.play().catch(e => {
        console.log("Esperando buffer...");
        // El evento 'waiting' manejará el estado
      });
  
    } catch (error) {
      console.error("Error en playSong:", error);
      playerStore.setState({ 
        isPlaying: false,
        currentAudio: null,
        buffering: {
          isBuffering: false,
          percentage: 0,
          buffered: 0
        }
      });
      throw error;
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
