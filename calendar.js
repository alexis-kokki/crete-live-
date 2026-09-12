const SUPABASE_URL = "https://skstztwseipuqpqtlzfa.supabase.co";
const SUPABASE_KEY = "sb_publishable_lnNg0aoYe4zsBKkV9XactA_IzcWBdiJ";

let events = [];
const now = new Date();
const todayISO = localISO(now);
let visibleMonth = new Date(now.getFullYear(), now.getMonth(), 1);
let selectedDate = todayISO;

const grid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("calendarMonth");
const eventsBox = document.getElementById("calendarEvents");
const empty = document.getElementById("calendarEmpty");

function localISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(v) { return v ? v.slice(0,5) : "Ώρα δεν έχει ανακοινωθεί"; }
function prettyDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("el-GR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}

function normalizeEvent(row) {
  const artists=(row.event_artists||[]).map(x=>x.artist?.name).filter(Boolean);
  const genres=(row.event_genres||[]).map(x=>x.genre?.name).filter(Boolean);
  return { id:row.id,title:row.title,event_date:row.event_date,time:formatTime(row.start_time),venue:row.venue?.name||row.venue_name_raw||"Χώρος προς επιβεβαίωση",region:row.region||"",city:row.city||"",price:row.price_text||"Δεν αναφέρεται",image:row.image_url||row.poster_url||"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=80",artists,genres,primaryGenre:genres[0]||"Live" };
}

async function loadAllEvents() {
  const select=["id","title","event_date","start_time","venue_name_raw","region","city","price_text","image_url","poster_url","venue:venues(name)","event_artists(artist:artists(name))","event_genres(genre:genres(name))"].join(",");
  const url=`${SUPABASE_URL}/rest/v1/events?select=${encodeURIComponent(select)}&status=eq.published&order=event_date.asc,start_time.asc`;
  try {
    const r=await fetch(url,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});
    if(!r.ok) throw new Error(await r.text());
    events=(await r.json()).map(normalizeEvent);
    renderCalendar();
    renderSelectedDay();
  } catch(e) {
    console.error(e);
    eventsBox.innerHTML='<div class="empty"><h3>Δεν φορτώθηκε το ημερολόγιο</h3><p>Δοκίμασε ανανέωση της σελίδας.</p></div>';
  }
}

function renderCalendar() {
  monthTitle.textContent=visibleMonth.toLocaleDateString("el-GR",{month:"long",year:"numeric"});
  grid.innerHTML="";
  const y=visibleMonth.getFullYear(),m=visibleMonth.getMonth();
  const first=new Date(y,m,1);
  const offset=(first.getDay()+6)%7;
  const days=new Date(y,m+1,0).getDate();
  for(let i=0;i<offset;i++){const blank=document.createElement("div");blank.className="calendar-day blank";grid.appendChild(blank);}
  for(let day=1;day<=days;day++){
    const date=new Date(y,m,day),iso=localISO(date);
    const count=events.filter(e=>e.event_date===iso).length;
    const btn=document.createElement("button");
    btn.className="calendar-day";
    if(iso<todayISO) btn.classList.add("past");
    if(iso===todayISO) btn.classList.add("today");
    if(iso===selectedDate) btn.classList.add("selected");
    btn.innerHTML=`<span class="day-number">${day}</span>${count?`<span class="live-count">${count} ${count===1?"live":"live"}</span>`:"<span class=\"no-live-dot\"></span>"}`;
    btn.addEventListener("click",()=>{selectedDate=iso;renderCalendar();renderSelectedDay();});
    grid.appendChild(btn);
  }
}

function renderSelectedDay() {
  const list=events.filter(e=>e.event_date===selectedDate);
  const past=selectedDate<todayISO;
  document.getElementById("selectedStatus").textContent=past?"Ολοκληρώθηκε":selectedDate===todayISO?"Σήμερα":"Επιλεγμένη ημέρα";
  document.getElementById("selectedDateTitle").textContent=prettyDate(selectedDate);
  empty.classList.toggle("hidden",list.length>0);
  eventsBox.innerHTML=list.map(e=>`<article class="event-card ${past?"past-event":""}"><div class="event-image-wrap"><img class="event-image" src="${e.image}" alt="${e.title}"><span class="badge">${past?"Ολοκληρώθηκε":e.primaryGenre}</span></div><div class="event-body"><div class="event-meta"><span>${e.region}${e.city&&e.city!==e.region?` · ${e.city}`:""}</span><span>${e.time}</span></div><h3 class="event-title">${e.title}</h3><p class="event-venue">${e.artists.length?e.artists.join(", ")+" · ":""}${e.venue}</p><div class="event-footer"><span class="price">${e.price}</span><span class="calendar-event-state">${past?"Έγινε":"Προσεχώς"}</span></div></div></article>`).join("");
}

document.getElementById("prevMonth").addEventListener("click",()=>{visibleMonth=new Date(visibleMonth.getFullYear(),visibleMonth.getMonth()-1,1);renderCalendar();});
document.getElementById("nextMonth").addEventListener("click",()=>{visibleMonth=new Date(visibleMonth.getFullYear(),visibleMonth.getMonth()+1,1);renderCalendar();});
document.getElementById("todayBtn").addEventListener("click",()=>{visibleMonth=new Date(now.getFullYear(),now.getMonth(),1);selectedDate=todayISO;renderCalendar();renderSelectedDay();});
loadAllEvents();
