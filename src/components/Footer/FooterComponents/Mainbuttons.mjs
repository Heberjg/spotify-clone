// Botones de canciones del MAIN
import { playerStore } from "../../../store/playerStore.mjs";

const handlers = new Set();

export const mainbutton = () => {
  handlers.forEach(({element, handler}) => {
    element.removeEventListener('click', handler);
  });
  handlers.clear();

  const handleButtonClick = (event) => {
    const button = event.currentTarget;
    const songId = button.getAttribute("data-id");
    playerStore.playSong(songId, 'main');
  };

  // Registrar nuevos listeners
  document.querySelectorAll(".Play-button").forEach(button => {
    button.addEventListener("click", handleButtonClick);
    handlers.add({element: button, handler: handleButtonClick});
  });

  // Actualización inicial
  updateMainButtons();
  
  // Suscribirse a cambios en el store
  return playerStore.subscribe(updateMainButtons);
};

const updateMainButtons = () => {
  const { currentSongId, isPlaying, currentLocation } = playerStore.getState();
  
  document.querySelectorAll(".Play-button").forEach((button) => {
    const songId = button.getAttribute("data-id");
    const isCurrentSong = currentSongId === songId;
    const iconPath = button.querySelector("svg > path");
    
    if (iconPath) {
      const isActive = isCurrentSong && isPlaying && currentLocation === 'main';
      iconPath.setAttribute("d", isActive ? 
        "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z" : 
        "M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"
      );
      button.setAttribute("aria-label", isActive ? "Pausar" : "Reproducir");
    }
  });
};
