
(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // BACKGROUND SWAP ON SCROLL
  const bgA = $('#bgA');
  const bgB = $('#bgB');
  const sections = $$('.section[data-bg]');
  const bgUrls = {
    0: "assets/bg4.jpg",
    1: "assets/bg1.jpg",
    2: "assets/bg2.jpg",
    3: "assets/bg3.jpg",
    4: "assets/bg4.jpg",
  };

  // Preload
  Object.values(bgUrls).forEach((src) => { const i = new Image(); i.src = src; });

  let active = 'A';
  let curIdx = 0;
  function setBg(idx) {
    if (idx === curIdx) return;
    curIdx = idx;
    const url = `url(${bgUrls[idx]})`;
    const inEl = active === 'A' ? bgB : bgA;
    const outEl = active === 'A' ? bgA : bgB;

    inEl.style.backgroundImage = url;
    inEl.classList.add('is-show');
    outEl.classList.remove('is-show');
    active = active === 'A' ? 'B' : 'A';
  }

  // initialize
  bgA.style.backgroundImage = `url(${bgUrls[0]})`;
  bgA.classList.add('is-show');

  const obs = new IntersectionObserver((entries) => {
    entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)
      .slice(0,1)
      .forEach((e) => {
        const idx = Number(e.target.getAttribute('data-bg') || '0');
        setBg(idx);
      });
  }, { threshold: [0.2, 0.35, 0.5, 0.65] });

  sections.forEach(s => obs.observe(s));

  // CALENDAR (AUG 2026, highlight 22)
  const grid = $('#calGrid');
  const month = 7; // August (0-based)
  const year = 2026;
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fill empty cells before 1st
  for (let i=0;i<startDay;i++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell is-empty';
    cell.textContent = '';
    grid.appendChild(cell);
  }
  for (let d=1; d<=daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    cell.textContent = String(d);
    if (d === 22) {
      cell.classList.add('is-love');
      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.setAttribute('aria-hidden','true');
      cell.appendChild(heart);
    }
    grid.appendChild(cell);
  }

  // TIMER
  const target = new Date('2026-08-22T00:00:00+03:00');
  const parts = {
    days: $('#tDays'),
    hours: $('#tHours'),
    mins: $('#tMins'),
    secs: $('#tSecs'),
  };

  function pad2(n){return String(n).padStart(2,'0')}

  function tick() {
    const now = new Date();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000*60*60*24));
    diff -= days * (1000*60*60*24);
    const hours = Math.floor(diff / (1000*60*60));
    diff -= hours * (1000*60*60);
    const mins = Math.floor(diff / (1000*60));
    diff -= mins * (1000*60);
    const secs = Math.floor(diff / 1000);

    parts.days.textContent = String(days);
    parts.hours.textContent = pad2(hours);
    parts.mins.textContent = pad2(mins);
    parts.secs.textContent = pad2(secs);
  }
  tick();
  setInterval(tick, 1000);

  // MUSIC: browsers often block autoplay; we start on user click
  const music = $('#bgMusic');
  const btn = $('#musicBtn');
  const icon = $('#musicIcon');
  const hint = $('#musicHint');

  async function toggleMusic() {
    if (!music) return;
    if (music.paused) {
      try {
        await music.play();
        btn.classList.add('is-on');
        icon.textContent = '♪';
        hint.textContent = 'музыка включена';
      } catch {
        hint.textContent = 'Нажмите ещё раз, чтобы включить музыку';
      }
    } else {
      music.pause();
      btn.classList.remove('is-on');
      icon.textContent = '♫';
      hint.textContent = 'музыка выключена';
    }
  }
  btn?.addEventListener('click', toggleMusic);

  // RSVP mock (no backend)
  const form = $('#rsvpForm');
  const out = $('#rsvpThanks');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    out.style.display = 'block';
    out.scrollIntoView({behavior:'smooth', block:'center'});
    form.reset();
  });
})();
