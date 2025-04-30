export function LinkClick() {
const CardSong = document.querySelectorAll(".Card-song")

CardSong.forEach(card => {
  const AudioPlayButtonMain = card.querySelector(".Play-button-card")
  AudioPlayButtonMain.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
  });

  const link = card.querySelector(".PlayLink")
  card.addEventListener("click", (e) => {
    if (e.target.closest(".Play-button-card")) return;
    if (link) link.click();
  });

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (link) link.click();
    }
  });
});
}