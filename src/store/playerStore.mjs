
let currentState = JSON.parse(sessionStorage.getItem('music-player-storage')) || {
      currentSongId: null,
      isPlaying: false,
      currentLocation: null,
      currentAudio: null,
      currentSongData: null,
      volumen: 0.7,
      buffering: {
        buffered: 0,          
        percentage: 0,        
        isBuffering: false,    
      },
      duration: null,
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
        volumen: currentState.volumen,
        duration: currentState.duration,
        // isplaying no se guarda para evitar la reproduccion automatica al recargar, solucion simple
      })
    );
    subscribers.forEach(cb => cb(currentState));
  },

  subscribe: (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  clearAllSubscriptions: () => {
    subscribers.clear();
  },
  
  cleanup: () => {
    if (currentState.currentAudio) {
      currentState.currentAudio.pause();
      currentState.currentAudio.src = '';
      currentState.currentAudio = null;
    }
    subscribers.clear();
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
        } else {
          await currentAudio.play();

        }
        return;
      }
  
      // Caso 2: Nueva canción o diferente ubicación
        const audioElement = currentAudio || new Audio();
        
        // Configuración del audio
        audioElement.src = song.Audio;
        audioElement.dataset.id = songId;
        audioElement.preload = 'auto';
        
        audioElement.onprogress = null;
        audioElement.onwaiting = null;

        await playerStore.setState({
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
          playerStore.setState({
            buffering: {
              buffered: bufferedEnd,
              percentage: percent,
              isBuffering: false
            }
          });
        }

      };
  
      audioElement.onwaiting = () => {
        playerStore.setState({
          buffering: {
            ...currentState.buffering,
            isBuffering: true
          }, 
        });
      };
  
      await audioElement.addEventListener('loadedmetadata', () => {
        console.log("Metadatos cargados");
          playerStore.setState({duration: audioElement.duration, currentAudio: audioElement})
      }, { once: true });

       playerStore.setState({
          currentLocation: location,
          isPlaying: true,
          currentSongId: songId,
          buffering: {
        buffered: 0,          
        percentage: 0,        
        isBuffering: true,    
      },
        })
      
      console.log(playerStore.getState())

      await audioElement.play()
  
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


