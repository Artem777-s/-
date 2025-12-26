(() => {
  const weddingDate = new Date(2026, 7, 22, 0, 0, 0); // 22 Aug 2026 (months: 0-11)
  const pad2 = (n) => String(n).padStart(2, "0");

  // Background crossfade
  const layerA = document.querySelector(".layer-a");
  const layerB = document.querySelector(".layer-b");
  const sections = Array.from(document.querySelectorAll("section.section"));
  const tops = () => sections.map(s => s.getBoundingClientRect().top + window.scrollY);
  let secTops = tops();
  let lastW = window.innerWidth;
  let rafId = 0;

  function setBg(urlA, urlB, mix){
    layerA.style.backgroundImage = `url('${urlA}')`;
    layerB.style.backgroundImage = `url('${urlB}')`;
    layerA.style.opacity = String(1 - mix);
    layerB.style.opacity = String(mix);
  }

  function updateBg(){
    const center = window.scrollY + window.innerHeight * 0.5;
    let i = 0;
    while (i < secTops.length - 1 && center >= secTops[i + 1]) i++;

    const cur = sections[i];
    const next = sections[Math.min(i + 1, sections.length - 1)];
    const curUrl = cur?.dataset?.bg || "assets/bg1.jpg";
    const nextUrl = next?.dataset?.bg || curUrl;

    const start = secTops[i];
    const end = secTops[Math.min(i + 1, secTops.length - 1)] || (start + window.innerHeight);
    const denom = Math.max(1, end - start);
    const mix = Math.min(1, Math.max(0, (center - start) / denom));

    // mix only if different
    if (curUrl === nextUrl) {
      setBg(curUrl, curUrl, 0);
    } else {
      setBg(curUrl, nextUrl, mix);
    }
  }

  function onScroll(){
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      updateBg();
    });
  }

  function onResize(){
    // Recompute tops if layout changes
    if (Math.abs(window.innerWidth - lastW) > 10) {
      lastW = window.innerWidth;
      secTops = tops();
      updateBg();
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    secTops = tops();
    updateBg();
  }, { passive: true });

  // Initial background
  setBg(sections[0].dataset.bg, sections[0].dataset.bg, 0);
  setTimeout(() => { secTops = tops(); updateBg(); }, 50);

  // Calendar render (August 2026)
  function renderCalendar(el, year, month0, heartDay){
    const monthNames = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
    const week = ["пн","вт","ср","чт","пт","сб","вс"];

    const first = new Date(year, month0, 1);
    const last = new Date(year, month0 + 1, 0);
    // Monday-based index: 0..6
    const firstIdx = (first.getDay() + 6) % 7;
    const daysInMonth = last.getDate();

    const header = document.createElement("div");
    header.className = "cal-header";
    header.innerHTML = `<div class="cal-month">${monthNames[month0]} ${year}</div>`;

    const weekRow = document.createElement("div");
    weekRow.className = "cal-week";
    weekRow.innerHTML = week.map(d => `<div>${d}</div>`).join("");

    const grid = document.createElement("div");
    grid.className = "cal-grid";

    // previous month trailing
    const prevLast = new Date(year, month0, 0).getDate();
    for (let i=0;i<firstIdx;i++){
      const d = document.createElement("div");
      d.className = "day muted";
      d.textContent = String(prevLast - (firstIdx - 1 - i));
      grid.appendChild(d);
    }
    // current month
    for (let dnum=1; dnum<=daysInMonth; dnum++){
      const d = document.createElement("div");
      d.className = "day";
      if (dnum === heartDay){
        d.classList.add("heart");
        d.innerHTML = `<span>${dnum}</span>`;
      } else {
        d.textContent = String(dnum);
      }
      grid.appendChild(d);
    }
    // next month leading to fill 6 rows (42 cells)
    const total = firstIdx + daysInMonth;
    const remaining = (42 - total) % 7 === 0 ? (42 - total) : (49 - total); // keep 6 or 7 rows, prefer 6
    const need = total <= 35 ? (42 - total) : (49 - total);
    for (let i=1;i<=need;i++){
      const d = document.createElement("div");
      d.className = "day muted";
      d.textContent = String(i);
      grid.appendChild(d);
    }

    el.innerHTML = "";
    el.appendChild(header);
    el.appendChild(weekRow);
    el.appendChild(grid);
  }

  const calEl = document.getElementById("calendar");
  if (calEl) renderCalendar(calEl, 2026, 7, 22);

  // Countdown
  const elDays = document.getElementById("cdDays");
  const elHours = document.getElementById("cdHours");
  const elMins = document.getElementById("cdMins");
  const elSecs = document.getElementById("cdSecs");

  function tick(){
    const now = new Date();
    let diff = weddingDate.getTime() - now.getTime();
    if (diff < 0) diff = 0;

    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    if (elDays) elDays.textContent = String(days);
    if (elHours) elHours.textContent = pad2(hours);
    if (elMins) elMins.textContent = pad2(mins);
    if (elSecs) elSecs.textContent = pad2(secs);
  }
  tick();
  setInterval(tick, 1000);

  // Music controls (autoplay-safe)
  const audio = document.getElementById("bgm");
  const btn = document.getElementById("musicBtn");
  const txt = document.getElementById("musicText");
  let isPlaying = false;

  async function toggleMusic(){
    try{
      if (!audio) return;
      if (!isPlaying){
        await audio.play();
        isPlaying = true;
        if (txt) txt.textContent = "Выключить";
        btn?.classList.add("on");
      } else {
        audio.pause();
        isPlaying = false;
        if (txt) txt.textContent = "Включить";
        btn?.classList.remove("on");
      }
    } catch(e){
      // If blocked, show a hint
      if (txt) txt.textContent = "Нажмите ещё раз";
    }
  }
  btn?.addEventListener("click", toggleMusic);

  // RSVP - send via mailto + copy to clipboard
  const form = document.getElementById("rsvpForm");
  const note = document.getElementById("formNote");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const attend = (fd.get("attend") || "").toString();
    const song = (fd.get("song") || "").toString().trim();

    const msg = [
      "Анкета гостя:",
      `Имя: ${name}`,
      `Присутствие: ${attend}`,
      song ? `Трек: ${song}` : "Трек: —"
    ].join("\n");

    try{
      await navigator.clipboard.writeText(msg);
      if (note) note.textContent = "Готово! Текст анкеты скопирован — можно отправить нам в сообщении.";
    } catch(err){
      if (note) note.textContent = "Готово! Можно отправить нам эти данные в сообщении.";
    }

    // Optional mailto (can be removed)
    const subject = encodeURIComponent("Анкета гостя — Артём и Ольга");
    const body = encodeURIComponent(msg);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  });
})();
