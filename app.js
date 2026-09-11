const events = [
  {
    id: 1,
    title: "Κρητικό γλέντι με λύρα & λαούτο",
    venue: "Ρακάδικο Το Μερακλίδικο",
    region: "Ηράκλειο",
    genre: "Κρητικά",
    date: "Σήμερα",
    time: "21:30",
    price: "Ελεύθερη",
    phone: "+302810000001",
    description: "Βραδιά με παραδοσιακή κρητική μουσική, λύρα, λαούτο και χορό μέχρι αργά.",
    maps: "https://www.google.com/maps/search/?api=1&query=Heraklion+Crete",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 2,
    title: "Ρεμπέτικη βραδιά",
    venue: "Το Κουτούκι",
    region: "Ρέθυμνο",
    genre: "Ρεμπέτικα",
    date: "Σήμερα",
    time: "22:00",
    price: "5€",
    phone: "+302831000002",
    description: "Μπουζούκι, κιθάρα και παλιά ρεμπέτικα σε μικρό ζεστό χώρο.",
    maps: "https://www.google.com/maps/search/?api=1&query=Rethymno+Crete",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 3,
    title: "Λαϊκά live μέχρι αργά",
    venue: "Μουσική Σκηνή 1900",
    region: "Χανιά",
    genre: "Λαϊκά",
    date: "Αύριο",
    time: "23:00",
    price: "8€",
    phone: "+302821000003",
    description: "Λαϊκό πρόγραμμα με γνωστές επιτυχίες και πλήρη μπάντα.",
    maps: "https://www.google.com/maps/search/?api=1&query=Chania+Crete",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 4,
    title: "Έντεχνο acoustic session",
    venue: "Αυλή",
    region: "Λασίθι",
    genre: "Έντεχνα",
    date: "Αύριο",
    time: "20:30",
    price: "Ελεύθερη",
    phone: "+302841000004",
    description: "Ακουστική βραδιά με ελληνικό έντεχνο ρεπερτόριο σε αυλή.",
    maps: "https://www.google.com/maps/search/?api=1&query=Agios+Nikolaos+Crete",
    image: "https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 5,
    title: "Κρητική βραδιά στο χωριό",
    venue: "Παραδοσιακό Καφενείο",
    region: "Ηράκλειο",
    genre: "Κρητικά",
    date: "Σαββατοκύριακο",
    time: "21:00",
    price: "10€",
    phone: "+302810000005",
    description: "Παραδοσιακό γλέντι με χορευτικό πρόγραμμα και τοπικούς μουσικούς.",
    maps: "https://www.google.com/maps/search/?api=1&query=Heraklion+Crete",
    image: "https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 6,
    title: "Ρεμπέτικα στην παλιά πόλη",
    venue: "Μικρό Μεϊντάνι",
    region: "Χανιά",
    genre: "Ρεμπέτικα",
    date: "Σαββατοκύριακο",
    time: "21:45",
    price: "Ελεύθερη",
    phone: "+302821000006",
    description: "Παρέα μουσικών με ρεμπέτικα και σμυρναίικα σε χαλαρό περιβάλλον.",
    maps: "https://www.google.com/maps/search/?api=1&query=Chania+Old+Town",
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1000&q=80"
  }
];

const state = { date: "all", region: "all", genre: "all", search: "" };

const eventsContainer = document.getElementById("eventsContainer");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("eventModal");

function renderEvents() {
  const term = state.search.trim().toLowerCase();

  const filtered = events.filter(e => {
    const dateOk = state.date === "all" || e.date === state.date;
    const regionOk = state.region === "all" || e.region === state.region;
    const genreOk = state.genre === "all" || e.genre === state.genre;
    const searchOk = !term || `${e.title} ${e.venue} ${e.region} ${e.genre}`.toLowerCase().includes(term);
    return dateOk && regionOk && genreOk && searchOk;
  });

  eventsContainer.innerHTML = filtered.map(e => `
    <article class="event-card">
      <div class="event-image-wrap">
        <img class="event-image" src="${e.image}" alt="${e.title}">
        <span class="badge">${e.genre}</span>
        <button class="fav" aria-label="Αγαπημένο" data-id="${e.id}">♡</button>
      </div>
      <div class="event-body">
        <div class="event-meta">
          <span>${e.date} · ${e.region}</span>
          <span>${e.time}</span>
        </div>
        <h3 class="event-title">${e.title}</h3>
        <p class="event-venue">${e.venue}</p>
        <div class="event-footer">
          <span class="price">${e.price === "Ελεύθερη" ? "Είσοδος ελεύθερη" : e.price}</span>
          <button class="details-btn" data-open="${e.id}">Λεπτομέρειες</button>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.classList.toggle("hidden", filtered.length > 0);
  document.getElementById("resultsTitle").textContent = filtered.length
    ? `${filtered.length} live ${filtered.length === 1 ? "βρέθηκε" : "βρέθηκαν"}`
    : "Δεν βρέθηκαν live";
}

function setupChips(containerId, key, dataAttr) {
  document.querySelectorAll(`#${containerId} .chip`).forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(`#${containerId} .chip`).forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state[key] = chip.dataset[dataAttr];
      renderEvents();
    });
  });
}

setupChips("dateChips", "date", "date");
setupChips("regionChips", "region", "region");
setupChips("genreChips", "genre", "genre");

document.getElementById("searchBtn").addEventListener("click", () => {
  state.search = searchInput.value;
  renderEvents();
});

searchInput.addEventListener("input", () => {
  state.search = searchInput.value;
  renderEvents();
});

document.getElementById("clearFilters").addEventListener("click", () => {
  state.date = "all";
  state.region = "all";
  state.genre = "all";
  state.search = "";
  searchInput.value = "";

  ["dateChips","regionChips","genreChips"].forEach(id => {
    document.querySelectorAll(`#${id} .chip`).forEach((c, i) => c.classList.toggle("active", i === 0));
  });
  renderEvents();
});

document.addEventListener("click", e => {
  if (e.target.classList.contains("fav")) {
    e.target.textContent = e.target.textContent === "♡" ? "♥" : "♡";
  }

  const id = e.target.dataset.open;
  if (id) openModal(Number(id));
});

function openModal(id) {
  const e = events.find(x => x.id === id);
  if (!e) return;

  document.getElementById("modalImage").src = e.image;
  document.getElementById("modalImage").alt = e.title;
  document.getElementById("modalBadge").textContent = e.genre;
  document.getElementById("modalTitle").textContent = e.title;
  document.getElementById("modalVenue").textContent = e.venue;
  document.getElementById("modalDate").textContent = e.date;
  document.getElementById("modalTime").textContent = e.time;
  document.getElementById("modalRegion").textContent = e.region;
  document.getElementById("modalPrice").textContent = e.price;
  document.getElementById("modalDescription").textContent = e.description;
  document.getElementById("mapsLink").href = e.maps;
  document.getElementById("phoneLink").href = `tel:${e.phone}`;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

document.getElementById("modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});

document.getElementById("bottomSearch").addEventListener("click", () => {
  searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => searchInput.focus(), 400);
});

document.getElementById("submitEventBtn").addEventListener("click", () => {
  alert("Στην επόμενη έκδοση εδώ θα ανοίγει φόρμα υποβολής εκδήλωσης.");
});

renderEvents();
