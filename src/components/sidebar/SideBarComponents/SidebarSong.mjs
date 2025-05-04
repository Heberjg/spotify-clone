
export const SideBarSong = () => {

// Abrir Biblioteca 
const openLibraryButton = document.getElementById("abrir-biblioteca");
const headerAside = document.getElementById("Header-aside");
const ContainerEtiqueta = document.getElementById("Container-Etiquetas");
const ContainerSongSearch = document.getElementById("Container-Song-Searcher");
const SongSearcher = document.getElementById("Song-searcher");
const SongDetails = document.querySelectorAll(".song-details");


let isExpanded = false

openLibraryButton?.addEventListener("click", () => {
  // Invertir el estado actual
  isExpanded = !isExpanded;
    
  // Actualizar clases del header
  if (headerAside) {
    headerAside.classList.toggle("Expanded", isExpanded);
    headerAside.classList.toggle("NotExpanded", !isExpanded);
  }
  
  // Actualizar visibilidad de elementos
  toggleVisibility(isExpanded);
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