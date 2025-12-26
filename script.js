// Countdown
(function(){
  const el=document.getElementById('countdown');
  if(!el) return;
  // 22 Aug 2026, 16:00 Moscow by default
  const target = new Date('2026-08-22T16:00:00+03:00').getTime();

  function pad(n){return String(n).padStart(2,'0');}
  function tick(){
    const now=Date.now();
    let diff = Math.max(0, target-now);
    const days = Math.floor(diff/(1000*60*60*24));
    diff -= days*1000*60*60*24;
    const hours = Math.floor(diff/(1000*60*60));
    diff -= hours*1000*60*60;
    const mins = Math.floor(diff/(1000*60));
    diff -= mins*1000*60;
    const secs = Math.floor(diff/1000);
    el.innerHTML = `
      <div class="cd-item"><span class="cd-num">${days}</span><span class="cd-lbl">дней</span></div>
      <div class="cd-item"><span class="cd-num">${pad(hours)}</span><span class="cd-lbl">часов</span></div>
      <div class="cd-item"><span class="cd-num">${pad(mins)}</span><span class="cd-lbl">минут</span></div>
      <div class="cd-item"><span class="cd-num">${pad(secs)}</span><span class="cd-lbl">сек</span></div>
    `;
  }
  tick();
  setInterval(tick,1000);
})();

// Background swap on scroll (crossfade)
(function(){
  const bgA = document.getElementById('bgA');
  const bgB = document.getElementById('bgB');
  if(!bgA || !bgB) return;

  const sections = [...document.querySelectorAll('section[data-bg]')];
  if(!sections.length) return;

  let showingA = true;
  function setBg(url){
    const show = showingA ? bgB : bgA;
    const hide = showingA ? bgA : bgB;
    show.style.backgroundImage = `url("${url}")`;
    show.classList.add('is-active');
    hide.classList.remove('is-active');
    showingA = !showingA;
  }

  // init first
  const first = sections[0].getAttribute('data-bg');
  bgA.style.backgroundImage = `url("${first}")`;
  bgA.classList.add('is-active');

  const obs = new IntersectionObserver((entries)=>{
    // pick the entry with highest intersectionRatio that is intersecting
    const visible = entries
      .filter(e=>e.isIntersecting)
      .sort((a,b)=>b.intersectionRatio - a.intersectionRatio)[0];
    if(!visible) return;
    const url = visible.target.getAttribute('data-bg');
    const currentA = bgA.style.backgroundImage.includes(url);
    const currentB = bgB.style.backgroundImage.includes(url);
    if(currentA || currentB) return;
    setBg(url);
  }, { threshold:[0.15,0.25,0.35,0.45,0.55] });

  sections.forEach(s=>obs.observe(s));
})();

// Music toggle
(function(){
  const btn=document.getElementById('musicBtn');
  const audio=document.getElementById('bgm');
  if(!btn || !audio) return;

  function setState(playing){
    btn.setAttribute('data-playing', playing ? '1' : '0');
    btn.title = playing ? 'Пауза' : 'Музыка';
  }

  // Autoplay restrictions: start only after user gesture
  btn.addEventListener('click', async ()=>{
    try{
      if(audio.paused){
        await audio.play();
        setState(true);
      }else{
        audio.pause();
        setState(false);
      }
    }catch(e){
      // ignore
    }
  });

  audio.addEventListener('pause', ()=>setState(false));
  audio.addEventListener('play', ()=>setState(true));
})();

// Smooth anchor scroll
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id=a.getAttribute('href');
      const target=document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
})();
