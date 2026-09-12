const SUPABASE_URL = "https://skstztwseipuqpqtlzfa.supabase.co";
const SUPABASE_KEY = "sb_publishable_lnNg0aoYe4zsBKkV9XactA_IzcWBdiJ";

let events = [];
const state = { date: "all", region: "all", genre: "all", search: "" };

const eventsContainer = document.getElementById("eventsContainer");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("eventModal");
const searchCard = document.querySelector(".search-card");
const searchSuggestions = document.createElement("div");
searchSuggestions.id = "searchSuggestions";
searchSuggestions.className = "search-suggestions hidden";
searchCard.appendChild(searchSuggestions);

function localDateISO(offsetDays = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function isWeekendDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function matchesDateFilter(event) {
  if (state.date === "all") return true;
  if (state.date === "Σήμερα") return event.event_date === localDateISO(0);
  if (state.date === "Αύριο") return event.event_date === localDateISO(1);
  if (state.date === "Σαββατοκύριακο") return isWeekendDate(event.event_date);
  return true;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("el-GR", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5);
}

function normalizeText(value = "") {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function normalizeEvent(row) {
  const artists = (row.event_artists || []).map(x => x.artist?.name).filter(Boolean);
  const genres = (row.event_genres || []).map(x => x.genre?.name).filter(Boolean);
  return {
    id: row.id, title: row.title, description: row.description || "", event_date: row.event_date,
    time: formatTime(row.start_time), venue: row.venue?.name || row.venue_name_raw || "Χώρος προς επιβεβαίωση",
    region: row.region, city: row.city || "", address: row.address || row.venue?.address || "",
    latitude: row.latitude ?? row.venue?.latitude ?? null, longitude: row.longitude ?? row.venue?.longitude ?? null,
    price: row.price_text || "Δεν αναφέρεται", phone: row.phone || row.venue?.phone || "", booking_url: row.booking_url || "",
    image: row.image_url || row.poster_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=80",
    artists, genres, primaryGenre: genres[0] || "Live", last_verified_at: row.last_verified_at
  };
}

async function loadEvents() {
  eventsContainer.innerHTML = `<div class="empty"><div class="empty-icon">♪</div><h3>Φόρτωση live...</h3><p>Παίρνουμε τα δεδομένα από τη βάση.</p></div>`;
  const select = ["id","title","description","event_date","start_time","venue_name_raw","region","city","address","latitude","longitude","price_text","phone","booking_url","image_url","poster_url","last_verified_at","venue:venues(name,address,latitude,longitude,phone)","event_artists(artist:artists(name))","event_genres(genre:genres(name))"].join(",");
  const today = localDateISO(0);
  const url = `${SUPABASE_URL}/rest/v1/events?select=${encodeURIComponent(select)}&status=eq.published&event_date=gte.${today}&order=event_date.asc,start_time.asc`;
  try {
    const response = await fetch(url, { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } });
    if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
    const rows = await response.json();
    events = rows.map(normalizeEvent);
    renderEvents();
  } catch (error) {
    console.error(error);
    eventsContainer.innerHTML = `<div class="empty"><div class="empty-icon">!</div><h3>Δεν φορτώθηκαν τα live</h3><p>Υπήρξε πρόβλημα σύνδεσης με τη βάση. Δοκίμασε ανανέωση.</p></div>`;
  }
}

function renderEvents() {
  const term = normalizeText(state.search);
  const filtered = events.filter(e => {
    const dateOk = matchesDateFilter(e);
    const regionOk = state.region === "all" || e.region === state.region;
    const genreOk = state.genre === "all" || e.genres.includes(state.genre);
    const searchText = normalizeText(`${e.title} ${e.venue} ${e.region} ${e.city} ${e.artists.join(" ")} ${e.genres.join(" ")}`);
    return dateOk && regionOk && genreOk && (!term || searchText.includes(term));
  });
  eventsContainer.innerHTML = filtered.map(e => `<article class="event-card"><div class="event-image-wrap"><img class="event-image" src="${e.image}" alt="${e.title}"><span class="badge">${e.primaryGenre}</span><button class="fav" aria-label="Αγαπημένο" data-id="${e.id}">♡</button></div><div class="event-body"><div class="event-meta"><span>${formatDate(e.event_date)} · ${e.region}</span><span>${e.time}</span></div><h3 class="event-title">${e.title}</h3><p class="event-venue">${e.artists.length ? e.artists.join(", ") + " · " : ""}${e.venue}</p><div class="event-footer"><span class="price">${e.price}</span><button class="details-btn" data-open="${e.id}">Λεπτομέρειες</button></div></div></article>`).join("");
  emptyState.classList.toggle("hidden", filtered.length > 0);
  document.getElementById("resultsTitle").textContent = filtered.length ? `${filtered.length} live ${filtered.length === 1 ? "βρέθηκε" : "βρέθηκαν"}` : "Δεν βρέθηκαν live";
}

function buildSearchSuggestions(query) {
  const term = normalizeText(query);
  if (!term) return [];
  const items = [], seen = new Set();
  const add = (type, label) => {
    if (!label) return;
    const normalizedLabel = normalizeText(label);
    if (!normalizedLabel.includes(term)) return;
    const key = `${type}|${normalizedLabel}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ type, label, startsWith: normalizedLabel.startsWith(term) });
  };
  events.forEach(e => { add("LIVE", e.title); add("ΧΩΡΟΣ", e.venue); add("ΠΕΡΙΟΧΗ", e.region); add("ΠΕΡΙΟΧΗ", e.city); e.artists.forEach(a => add("ΚΑΛΛΙΤΕΧΝΗΣ", a)); e.genres.forEach(g => add("ΕΙΔΟΣ", g)); });
  return items.sort((a,b) => Number(b.startsWith)-Number(a.startsWith) || a.label.localeCompare(b.label,"el")).slice(0,8);
}

function hideSearchSuggestions() { searchSuggestions.classList.add("hidden"); searchSuggestions.innerHTML = ""; }
function selectSearchSuggestion(item) { searchInput.value=item.label; state.search=item.label; hideSearchSuggestions(); renderEvents(); scrollToResults(); }
function renderSearchSuggestions() {
  const items=buildSearchSuggestions(searchInput.value);
  if(!items.length){hideSearchSuggestions();return;}
  searchSuggestions.innerHTML="";
  items.forEach(item=>{const button=document.createElement("button");button.type="button";button.className="search-suggestion";const type=document.createElement("span");type.className=`search-suggestion-type type-${item.type.toLowerCase()}`;type.textContent=item.type;const label=document.createElement("span");label.className="search-suggestion-label";label.textContent=item.label;button.append(type,label);button.addEventListener("click",()=>selectSearchSuggestion(item));searchSuggestions.appendChild(button);});
  searchSuggestions.classList.remove("hidden");
}
function scrollToResults(){const s=document.getElementById("resultsTitle")?.closest("section");if(s)requestAnimationFrame(()=>s.scrollIntoView({behavior:"smooth",block:"start"}));}
function setupChips(containerId,key,dataAttr){document.querySelectorAll(`#${containerId} .chip`).forEach(chip=>chip.addEventListener("click",()=>{document.querySelectorAll(`#${containerId} .chip`).forEach(c=>c.classList.remove("active"));chip.classList.add("active");state[key]=chip.dataset[dataAttr];renderEvents();}));}
setupChips("dateChips","date","date");setupChips("regionChips","region","region");setupChips("genreChips","genre","genre");
function runSearchAndScroll(){state.search=searchInput.value;hideSearchSuggestions();renderEvents();scrollToResults();}
document.getElementById("searchBtn").addEventListener("click",runSearchAndScroll);
searchInput.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();runSearchAndScroll();}if(event.key==="Escape")hideSearchSuggestions();});
searchInput.addEventListener("input",()=>{if(!searchInput.value.trim()){state.search="";renderEvents();hideSearchSuggestions();return;}renderSearchSuggestions();});
searchInput.addEventListener("focus",()=>{if(searchInput.value.trim())renderSearchSuggestions();});
document.addEventListener("click",event=>{if(!searchCard.contains(event.target))hideSearchSuggestions();});
document.getElementById("clearFilters").addEventListener("click",()=>{state.date="all";state.region="all";state.genre="all";state.search="";searchInput.value="";hideSearchSuggestions();["dateChips","regionChips","genreChips"].forEach(id=>document.querySelectorAll(`#${id} .chip`).forEach((c,i)=>c.classList.toggle("active",i===0)));renderEvents();});
document.addEventListener("click",e=>{if(e.target.classList.contains("fav"))e.target.textContent=e.target.textContent==="♡"?"♥":"♡";const id=e.target.dataset.open;if(id)openModal(id);});
function mapsUrl(e){if(e.latitude!==null&&e.longitude!==null)return `https://www.google.com/maps/search/?api=1&query=${e.latitude},${e.longitude}`;return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue} ${e.address} ${e.city} Κρήτη`)}`;}
function openModal(id){const e=events.find(x=>x.id===id);if(!e)return;document.getElementById("modalImage").src=e.image;document.getElementById("modalImage").alt=e.title;document.getElementById("modalBadge").textContent=e.primaryGenre;document.getElementById("modalTitle").textContent=e.title;document.getElementById("modalVenue").textContent=`${e.artists.length?e.artists.join(", ")+" · ":""}${e.venue}`;document.getElementById("modalDate").textContent=formatDate(e.event_date);document.getElementById("modalTime").textContent=e.time;document.getElementById("modalRegion").textContent=e.region;document.getElementById("modalPrice").textContent=e.price;document.getElementById("modalDescription").textContent=e.description||"Δεν υπάρχει ακόμη περιγραφή.";document.getElementById("mapsLink").href=mapsUrl(e);const phoneLink=document.getElementById("phoneLink");if(e.phone){phoneLink.href=`tel:${e.phone}`;phoneLink.textContent="Κράτηση";phoneLink.style.opacity="1";phoneLink.style.pointerEvents="auto";}else if(e.booking_url){phoneLink.href=e.booking_url;phoneLink.target="_blank";phoneLink.textContent="Κράτηση";phoneLink.style.opacity="1";phoneLink.style.pointerEvents="auto";}else{phoneLink.removeAttribute("href");phoneLink.textContent="Χωρίς κράτηση";phoneLink.style.opacity=".55";phoneLink.style.pointerEvents="none";}modal.classList.remove("hidden");document.body.style.overflow="hidden";}
function closeModal(){modal.classList.add("hidden");document.body.style.overflow="";}
document.getElementById("modalClose").addEventListener("click",closeModal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal();});
document.getElementById("bottomSearch").addEventListener("click",()=>{searchInput.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>searchInput.focus(),400);});
document.getElementById("submitEventBtn").addEventListener("click",()=>alert("Η φόρμα υποβολής θα συνδεθεί στο επόμενο βήμα με τον πίνακα submissions."));
loadEvents();
