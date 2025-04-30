
let isInitialized = false;

export const SideBarSong = () => {
 // Evitar duplicación de listeners
if (isInitialized) return;


// Abrir Biblioteca 
const openLibraryButton = document.getElementById("abrir-biblioteca");
const headerAside = document.getElementById("Header-aside");
const ContainerEtiqueta = document.getElementById("Container-Etiquetas");
const ContainerSongSearch = document.getElementById("Container-Song-Searcher");
const SongSearcher = document.getElementById("Song-searcher");
const SongDetails = document.querySelectorAll(".song-details");
const sidebar = document.getElementById("sidebar");


openLibraryButton?.addEventListener("click", () => {
  const isExpanded = sidebar?.getAttribute("aria-expanded") === "true";
  sidebar?.setAttribute("aria-expanded", !isExpanded);
  if (isInitialized) {
    localStorage.setItem('sidebar-expanded', !isExpanded);
    isInitialized = false;
  } else {
    localStorage.setItem('sidebar-expanded', !isExpanded);
    isInitialized = false;
  }
  
  // Alternar clases del headerAside
  headerAside?.classList.toggle("Expanded", !isExpanded);
  headerAside?.classList.toggle("NotExpanded", isExpanded);
  
  // Actualizar visibilidad de elementos
  toggleVisibility(!isExpanded);
})

function toggleVisibility(show) {
  
  
  ContainerEtiqueta?.classList.toggle("InvisibleItem", !show);
  ContainerEtiqueta?.classList.toggle("VisibleItem", show);
  
  ContainerSongSearch?.setAttribute("aria-expanded", show);
  SongSearcher?.classList.toggle("InvisibleItem", !show);
  SongSearcher?.classList.toggle("VisibleItem", show);
  SongSearcher?.setAttribute("aria-hidden", !show);
  
  SongDetails.forEach(detail => {
    detail.classList.toggle("visible", show);
    detail.classList.toggle("invisible", !show);
  });
}
}