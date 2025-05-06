
let currentState = JSON.parse(sessionStorage.getItem('music-player-storage')) || {
      currentSongId: null,
      isPlaying: false,
      currentLocation: null,
      currentAudio: null,
      currentSongData: null,
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
      await new Promise((resolve, reject) => {
        const handleLoaded = () => {
          audioElement.removeEventListener('canplaythrough', handleLoaded);
          audioElement.removeEventListener('error', handleError);
          resolve();
        };
        
        const handleError = (err) => {
          audioElement.removeEventListener('canplaythrough', handleLoaded);
          audioElement.removeEventListener('error', handleError);
          reject(err);
        };
        
        audioElement.addEventListener('canplaythrough', handleLoaded);
        audioElement.addEventListener('error', handleError);
        audioElement.load();
      });
  
      // Actualizar estado y reproducir
      playerStore.setState({
        currentSongId: songId,
        isPlaying: true,
        currentLocation: location,
        currentAudio: audioElement,
      });
  
      audioElement.play();
  
    } catch (error) {
      console.error("Error en playSong:", error);
      playerStore.setState({ 
        isPlaying: false,
        currentAudio: null,
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
