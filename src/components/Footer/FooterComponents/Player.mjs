
import { songs } from "../../../Content/Songs.mjs";

export async function Player() {
  const AudioPlayButton = document.getElementById("Audio-Play");
  const Audio = document.getElementById("Audio");
  const AudioPlayMain = document.querySelectorAll(".Play-button-card");
  let currentAudio = Audio;
  let isPlaying = false;
  let currentSongId = "";

  // Función para manejar play/pause
  AudioPlayButton?.addEventListener("click", async () => {
    if (!currentAudio) return;

    if (isPlaying) {
      await currentAudio.pause();
      return;
    } if (!currentSongId && songs.length > 0) {
      await playSong(songs[0].id);
    } else {
      try {
        await currentAudio.play();
        isPlaying = true;
      } catch (error) {
        console.error("Error al reanudar:", error);
      }
    }
    updatePlayButton();
});


  // Función para reproducir canción
  const playSong = async (songId) => {
    if (!songId || !currentAudio) return;
    
    const song = songs.find(s => s.id === songId);
    if (!song?.Audio) return;
    
    const isSameSong = currentSongId === songId;
    currentSongId = songId;
    currentAudio.src = song.Audio;
    currentAudio.dataset.id = songId;


    try {
    if (isSameSong && isPlaying) {
        currentAudio.pause();
        console.log("Pausando:", song.Name);
        isPlaying = false;
      } else {
        await currentAudio.play();
        console.log(isSameSong ? "Reanudando:" : "Reproduciendo nueva canción:", song.Name);
        isPlaying = true;
      }
    } catch (error) {
      isPlaying = false;
      console.error(`Error al ${isSameSong && !isPlaying ? 'reanudar' : 'reproducir'}:`, error);
    }

    updatePlayButton();
  };

  // Control de botones de la sidebar
  function SideBarSongsPlay() {
    const sideBarButton = document.querySelectorAll(".Song-button-aside");
    
    sideBarButton?.forEach((button) => {
      button.addEventListener("click", () => {
        const songId = button.getAttribute("data-id");
        const isSameSong = currentSongId == songId;
        if (isSameSong && !isPlaying) {
        // Reproducir la canción actual si está pausada
        currentAudio.play();
        } else if (isSameSong && isPlaying) {
          // Pausar la canción actual si está sonando
          currentAudio.pause();
        } else {
          // Reproducir una nueva canción
        playSong(songId);
      }
      });
    });
  }

  // Actualización del botón de play/pause
  const updatePlayButton = () => {
    if (!AudioPlayButton) return;
    const iconPath = AudioPlayButton.querySelector("span > svg > path");
    if (!iconPath) return;

    const [playIcon, pauseIcon] = [
      "M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z",
      "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"
    ];

    if (isPlaying) {
      AudioPlayButton.setAttribute("aria-label", "Pausar");
      

      iconPath.setAttribute("d", pauseIcon);
    } else {
      AudioPlayButton.setAttribute("aria-label", "Reproducir");
      iconPath.setAttribute("d", playIcon);
    }


  };

  // Eventos del reproductor
  ['play', 'pause', 'ended'].forEach(event => {
    Audio.addEventListener(event, () => {
      isPlaying = event === 'play';
      updatePlayButton();
    });
  });

  // Inicialización
  SideBarSongsPlay();
}