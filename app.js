const events = [
  {
    title: "Κρητικό γλέντι με λύρα & λαούτο",
    venue: "Ρακάδικο Το Μερακλίδικο",
    city: "Ηράκλειο",
    genre: "Κρητικά",
    time: "21:30",
    price: "Είσοδος ελεύθερη",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Ρεμπέτικη βραδιά",
    venue: "Το Κουτούκι",
    city: "Ρέθυμνο",
    genre: "Ρεμπέτικα",
    time: "22:00",
    price: "5€",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Λαϊκά live μέχρι αργά",
    venue: "Μουσική Σκηνή 1900",
    city: "Χανιά",
    genre: "Λαϊκά",
    time: "23:00",
    price: "8€",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Έντεχνο acoustic session",
    venue: "Αυλή",
    city: "Άγιος Νικόλαος",
    genre: "Έντεχνα",
    time: "20:30",
    price: "Είσοδος ελεύθερη",
    image: "https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=900&q=80"
  }
];

const eventsContainer = document.getElementById("eventsContainer");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
let activeGenre = "all";

function renderEvents() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = events.filter(e => {
    const genreOk = activeGenre === "all" || e.genre === activeGenre;
    const searchOk = !term || `${e.title} ${e.venue} ${e.city} ${e.genre}`.toLowerCase().includes(term);
    return genreOk && searchOk;
  });

  eventsContainer.innerHTML = filtered.map(e => `
    <article class="event-card">
      <div class="event-image-wrap">
        <img class="event-image" src="${e.image}" alt="${e.title}">
        <span class="badge">${e.genre}</span>
        <button class="fav" aria-label="Αγαπημένο">♡</button>
      </div>
      <div class="event-body">
        <div class="event-meta">
          <span>${e.city}</span>
          <span>${e.time}</span>
        </div>
        <h3 class="event-title">${e.title}</h3>
        <p class="event-venue">${e.venue}</p>
        <div class="event-footer">
          <span class="price">${e.price}</span>
          <button class="details-btn">Λεπτομέρειες</button>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.classList.toggle("hidden", filtered.length > 0);
}

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeGenre = chip.dataset.genre;
    renderEvents();
  });
});

document.getElementById("searchBtn").addEventListener("click", renderEvents);
searchInput.addEventListener("input", renderEvents);
document.getElementById("showAllBtn").addEventListener("click", () => {
  activeGenre = "all";
  searchInput.value = "";
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset.genre === "all"));
  renderEvents();
});

document.addEventListener("click", e => {
  if (e.target.classList.contains("fav")) {
    e.target.textContent = e.target.textContent === "♡" ? "♥" : "♡";
  }
});

renderEvents();
