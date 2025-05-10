// Botones de canciones del MAIN
import { playerStore } from "../../../store/playerStore.mjs";
import { handleSongChange } from "../FooterComponents/Player.mjs";
const { isPlaying } = playerStore.getState()


export const mainbutton = () => {
  const updateMainButtons = () => {
  const { currentSongId, isPlaying, currentLocation } = playerStore.getState();
  if (currentLocation !== "main") return;
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

// Suscribirse a cambios en el store
const unsubscribe = playerStore.subscribe(updateMainButtons);
// Configurar listeners iniciales
let lastClick = 0;
document.querySelectorAll(".Play-button").forEach(button => {
  button.addEventListener("click", async () => {
    const now = Date.now();
        if (now - lastClick < 500) return; // Throttle de 500ms
        lastClick = now;
        handleSongChange(button, "main").catch(console.error);
      });
    });

// Retornar función de limpieza
  return () => {
    unsubscribe();
    document.querySelectorAll(".Play-button").forEach(button => {
      button.replaceWith(button.cloneNode(true)); // Limpia todos los listeners
    });
  };
}


  