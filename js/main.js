/* =====================================================
   ★ EDIT ME — your settings & personal message
   ===================================================== */
const CONFIG = {
  // ★ YOUR BIRTHDAY LETTER — each string is one paragraph.
  letter: [
    "Dear Cinta,",
    "Semoga diumur mu yang ke 21 dan seterusnya akan selalu datang hal hal yang membuat dirimu bahagia serta jutaan alasan yang membuat mu selalu tersenyum.",
    "21 Tahun adalah perjalanan yang panjang dan tentunya ga mudah. Tapi kamu hebat udah bisa lewatin itu semua dan sampai ke titik ini.",
    "Semoga kamu selalu diberi kesehatan, panjang umur, rejeki yang melimpah, dan semoga selalu dimudahkan dalam segala urusannya. dan juga semoga seluruh impianmu tercapai.",
    "You deserve all the good things in this world Cinta.",
    "SEMANGATTT UNTUK SETIAP HARINYAA!.",
    "From Miaw."
  ],
  // ★ WISH SCREEN PICTURES — [0] = before blowing the candle, [1] = after (it swaps when the button is tapped)
  wishImages: ['assets/images/wish1.png','assets/images/wish2.png'],
  greetingBurstAt: 3300,  // ms after the greeting opens: confetti burst (picture is fully visible by then)
  greetingEvery: 3500,    // ms each greeting picture stays before fading to the next
  typeSpeed: 75,          // ms per letter (higher = slower)
  decorEvery: 900,        // ms between floating hearts/sparkles
  decor: ['♡','✦','✧','♥','✿','⋆'],
  confettiColors: ['#F8DDEB','#E9E0F8','#DCEBFA','#FFF8EC','#F8C9DE','#FFE9A8'],
  confettiCount: 150,
  // closing screen photo toss
  tossSeconds: [2.8, 4.0],   // flight time range per throw
  tossPauseMs: [300, 1400],  // rest (out of view) between throws
  musicVolume: 0.5
};

/* ===================== Helpers ===================== */
const $ = s => document.querySelector(s);
const screens = [...document.querySelectorAll('.screen')];
let current = 0, typeTimer = null, letterBusy = false;

function go(n) {
  screens[current].classList.remove('active');
  current = n;
  screens[n].classList.add('active');
  if (n === 1) startSlides(); else stopSlides();
  if (n === 4) { startToss(); setTimeout(confetti, 1500); } else stopToss();
}

/* ===================== Floating hearts & sparkles ===================== */
const fx = $('#fx');
setInterval(() => {
  if (document.hidden) return;
  const s = document.createElement('span');
  s.className = 'fx';
  s.textContent = CONFIG.decor[Math.random() * CONFIG.decor.length | 0];
  s.style.cssText = `left:${Math.random() * 100}%;font-size:${10 + Math.random() * 16}px;` +
    `color:${['#F8C9DE','#D7C8F2','#BFD8F3','#F5D9A0'][Math.random() * 4 | 0]};--t:${7 + Math.random() * 5}s;` +
    `--x:${(Math.random() - .5) * 60}px;--r:${(Math.random() - .5) * 90}deg`;
  fx.appendChild(s);
  setTimeout(() => s.remove(), 12500);
}, CONFIG.decorEvery);

/* ===================== Confetti ===================== */
const cv = $('#confetti'), cx = cv.getContext('2d');
let bits = [], running = false;
function fit() { cv.width = innerWidth; cv.height = innerHeight; }
addEventListener('resize', fit); fit();
function confetti() {
  for (let i = 0; i < CONFIG.confettiCount; i++) bits.push({
    x: cv.width / 2 + (Math.random() - .5) * 120, y: cv.height * .55,
    vx: (Math.random() - .5) * 14, vy: -Math.random() * 15 - 4, w: 6 + Math.random() * 6, h: 4 + Math.random() * 5,
    r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: CONFIG.confettiColors[Math.random() * 6 | 0], life: 1
  });
  if (!running) { running = true; tick(); }
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  bits.forEach(b => {
    b.vy += .28; b.vx *= .99; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.life -= .004;
    cx.save(); cx.globalAlpha = Math.max(b.life, 0); cx.translate(b.x, b.y); cx.rotate(b.r);
    cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
  });
  bits = bits.filter(b => b.life > 0 && b.y < cv.height + 20);
  if (bits.length) requestAnimationFrame(tick); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
}

/* ===================== Music ===================== */
// Browsers block sound until the visitor interacts with the page, so music starts on the
// FIRST tap anywhere (the visitor has to tap the opening picture anyway). The ♪ button toggles it.
const bgm = $('#bgm'), mbtn = $('#music');
bgm.volume = CONFIG.musicVolume;
let userPaused = false;
function autoStartMusic(e) {
  if (userPaused || (e.target.closest && e.target.closest('#music'))) return;
  bgm.play().then(() => {
    mbtn.classList.add('on');
    ['pointerdown', 'touchend', 'keydown'].forEach(ev => removeEventListener(ev, autoStartMusic));
  }).catch(() => {});                      // blocked? we simply try again on the next tap
}
['pointerdown', 'touchend', 'keydown'].forEach(ev => addEventListener(ev, autoStartMusic));
mbtn.onclick = () => {
  if (bgm.paused) { userPaused = false; bgm.play().then(() => mbtn.classList.add('on')).catch(() => {}); }
  else { userPaused = true; bgm.pause(); mbtn.classList.remove('on'); }
};

/* ===================== Section 1 → 2 ===================== */
$('#photo1').onclick = e => {
  const b = e.currentTarget; if (b.classList.contains('opening')) return;
  b.classList.add('opening');
  setTimeout(() => go(1), 750);
};
$('#photo2').onclick = () => go(2);

/* ===================== Greeting pictures swap by themselves ===================== */
const slides = [...document.querySelectorAll('#photo2 .gslide')];
let slideIdx = 0, slideTimer = null, slideStart = null, burstTimers = [];
function showSlide(i) { slides.forEach((s, k) => s.classList.toggle('on', k === i)); slideIdx = i; }
function startSlides() {
  stopSlides();
  // confetti burst once the picture has appeared (same effect as the wish screen)
  burstTimers = [setTimeout(confetti, CONFIG.greetingBurstAt), setTimeout(confetti, CONFIG.greetingBurstAt + 500)];
  slideStart = setTimeout(() => {          // begin after the picture has faded in
    slideTimer = setInterval(() => showSlide((slideIdx + 1) % slides.length), CONFIG.greetingEvery);
  }, 2600);
}
function stopSlides() { burstTimers.forEach(clearTimeout); clearTimeout(slideStart); clearInterval(slideTimer); showSlide(0); }

/* ===================== Section 3: Letter ===================== */
const stage = $('#stage');
stage.onclick = () => {
  if (letterBusy) return; letterBusy = true;
  $('#letterHint').style.opacity = 0;
  stage.classList.add('open');                                   // 1. flap opens
  setTimeout(() => stage.classList.add('slide'), 900);           // 2. paper rises out
  setTimeout(() => { stage.classList.add('out'); sparkleBurst(); }, 2400);   // 3. envelope fades, paper grows
  setTimeout(typeLetter, 3700);                                  // 4. words appear slowly
};
function typeLetter() {
  const el = $('#letterText'), paper = $('#paper'), text = CONFIG.letter.join('\n\n');
  let i = 0; el.textContent = '';
  typeTimer = setInterval(() => {
    const s = document.createElement('span'); s.textContent = text[i++]; el.appendChild(s);
    paper.scrollTo({ top: paper.scrollHeight, behavior: 'smooth' });
    if (i >= text.length) {
      clearInterval(typeTimer);
      setTimeout(() => { const b = $('#toWish'); b.hidden = false; b.classList.add('pop'); }, 900);
    }
  }, CONFIG.typeSpeed);
}
function sparkleBurst() {
  for (let i = 0; i < 14; i++) setTimeout(() => {
    const s = document.createElement('span'); s.className = 'fx';
    s.textContent = i % 2 ? '♡' : '✦';
    s.style.cssText = `left:${30 + Math.random() * 40}%;bottom:35%;font-size:${14 + Math.random() * 14}px;color:#F2B5D0;--t:3s;--x:${(Math.random() - .5) * 160}px;--r:40deg`;
    fx.appendChild(s); setTimeout(() => s.remove(), 3200);
  }, i * 70);
}
$('#toWish').onclick = () => go(3);

/* ===================== Section 4: Wish ===================== */
const wishImg = $('#wishImg');
CONFIG.wishImages.forEach(src => { new Image().src = src; });
function setWishImage(i) {
  wishImg.classList.add('out');
  setTimeout(() => { wishImg.src = CONFIG.wishImages[i]; wishImg.classList.remove('out'); }, 260);
}
$('#blow').onclick = e => {
  e.currentTarget.style.display = 'none';
  setWishImage(1);                       // picture 1 → picture 2
  confetti(); setTimeout(confetti, 500);
  $('#wishMsg').classList.add('show');
  setTimeout(() => { const b = $('#toGarden'); b.hidden = false; b.classList.add('pop'); }, 2200);
};
$('#toGarden').onclick = () => go(4);

/* ===================== Section 5: photos tossed in random directions ===================== */
const tossBox = $('#toss'), pics = [...document.querySelectorAll('.pic')];
let tossToken = 0, tossTimers = [];
const rand = (a, b) => a + Math.random() * (b - a);

function launch(p, token) {
  if (token !== tossToken) return;
  const W = tossBox.clientWidth, H = tossBox.clientHeight, pw = p.offsetWidth, ph = p.offsetHeight;
  const x0 = rand(.05, .95) * W - pw / 2;                              // random start
  const x1 = Math.min(Math.max(x0 + (Math.random() - .5) * W * 1.1, -pw * .3), W - pw * .7);  // random direction
  const y0 = ph * 1.3, ya = -rand(.4, .85) * H;                        // below screen → random peak height
  const spin = (Math.random() < .5 ? -1 : 1) * rand(90, 300), r0 = rand(-20, 20), ta = .4;
  const k = (y0 - ya) / (ta * ta), frames = [];
  for (let s = 0; s <= 48; s++) {
    const t = s / 48, y = ya + k * (t - ta) * (t - ta);
    frames.push({ transform: `translate(${x0 + (x1 - x0) * t}px,${y}px) rotate(${r0 + spin * t}deg)` });
  }
  const anim = p.animate(frames, { duration: rand(...CONFIG.tossSeconds) * 1000, easing: 'linear', fill: 'forwards' });
  anim.onfinish = () => {                                             // fell out of view → rest, then throw again
    tossTimers.push(setTimeout(() => launch(p, token), rand(...CONFIG.tossPauseMs)));
  };
}
function startToss() {
  stopToss(); const token = ++tossToken;
  pics.forEach((p, i) => tossTimers.push(setTimeout(() => launch(p, token), 700 + i * 700)));
}
function stopToss() {
  tossToken++; tossTimers.forEach(clearTimeout); tossTimers = [];
  pics.forEach(p => p.getAnimations().forEach(a => a.cancel()));
}

/* ===================== Text fade-in: wait for fonts so nothing "pops" ===================== */
Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))])
  .then(() => document.body.classList.add('ready'));

/* ===================== Replay ===================== */
$('#replay').onclick = () => {
  clearInterval(typeTimer); letterBusy = false; bits = [];
  stage.className = 'stage'; $('#letterText').textContent = ''; $('#paper').scrollTop = 0;
  $('#letterHint').style.opacity = 1; $('#toWish').hidden = true; $('#toWish').classList.remove('pop');
  $('#blow').style.display = ''; wishImg.src = CONFIG.wishImages[0];
  $('#wishMsg').classList.remove('show'); $('#toGarden').hidden = true; $('#toGarden').classList.remove('pop');
  $('#photo1').classList.remove('opening');
  go(0);
};
