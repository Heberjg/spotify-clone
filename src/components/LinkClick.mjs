

export function LinkClick() {
const CardSong = document.querySelectorAll(".Card-song")

CardSong.forEach(card => {

  const link = card.querySelector(".PlayLink")
  card.addEventListener("click", (e) => {
    if (e.target.closest(".Play-button")) return;
    if (link) link.click();
  });

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (e.target.closest(".Play-button")) return;
      if (link) link.click();
    }
  });
});
}