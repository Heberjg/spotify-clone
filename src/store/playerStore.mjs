
let currentState = typeof sessionStorage !== 'undefined' 
  ? JSON.parse(sessionStorage.getItem('music-player-storage')) || {
      currentSongId: null,
      isPlaying: false,
      currentLocation: null,
      currentAudio: null,
      currentSongData: null,
    }
  : {
      currentSongId: null,
      isPlaying: false,
      currentLocation: null,
      currentAudio: null,
      currentSongData: null,
    };

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
    const { currentSongId, isPlaying, currentAudio, currentLocation } = currentState;
    const song = songs.find(s => s.id === songId);
    if (!song?.Audio) return;

    const isSameSong = currentSongId === songId;
    const isSameLocation = currentLocation === location
  
    if (isSameSong && isSameLocation) {
      try {
        if (isPlaying) {
          currentAudio.pause();
          playerStore.setState({ isPlaying: false });
        } else {
          await currentAudio.play();
          playerStore.setState({ isPlaying: true });
        }
        // updatePlayButton();
        return;
      } catch (error) {
        console.error("Error al toggle play/pause:", error);
        return;
      }
    }
    //  Caso 2: Misma canción diferente ubicación o canción nueva
    
  try {
    // Pausar y resetear si hay algo reproduciéndose
    if (currentAudio && isPlaying) {
      currentAudio.pause();
    } 
      // Configurar nueva canción
      currentAudio.src = song.Audio;
      currentAudio.dataset.id = songId;
  
      // Reproducir
      await currentAudio.play();
      playerStore.setState({ 
        currentSongId: songId,
        currentSongData: { // Agrega este objeto con toda la info
          name: song.Name,
          artist: song.Artist,
          image: song.Image,
        },
        isPlaying: true,
        currentLocation: location,
        currentAudio
      });

  } catch (error) {
    console.error("Error al reproducir:", error);
    playerStore.setState({ isPlaying: false });
  }
  
  },
  

  // Change stated of the button from pause to play and backwards
  togglePlay: () => {
    const { isPlaying, currentAudio } = currentState;
    if (!currentAudio) return;
    
    if (isPlaying) {
      currentAudio.pause();
      playerStore.setState({ isPlaying: false });
    } else {
      currentAudio.play()
        .then(() => playerStore.setState({ isPlaying: true }))
        .catch(e => console.error("Error al reproducir:", e));
    }
  }
};
