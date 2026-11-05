(() => {
  'use strict';
  // Birthday unlock is fixed to midnight in India Standard Time (UTC+05:30).
  const UNLOCK_AT = new Date('2026-11-29T00:00:00+05:30').getTime();
  const PREVIEW_MODE = new URLSearchParams(window.location.search).get('preview') === '1';
  const $ = (id) => document.getElementById(id);
  const lockScreen = $('lockScreen');
  const birthdayContent = $('birthdayContent');
  const unlockBtn = $('unlockBtn');
  const countdown = $('countdown');
  let unlockedByVisitor = false;

  function showBirthday() {
    lockScreen.hidden = true;
    birthdayContent.hidden = false;
    document.body.classList.add('is-unlocked');
    window.scrollTo({ top: 0, behavior: 'instant' });
    startRevealObserver();
    burstConfetti(150);
    // Browsers may block autoplay. The visible music button always remains available.
    tryPlayMusic();
  }

  function updateCountdown() {
    if (PREVIEW_MODE) {
      $('lockHint').textContent = 'Private preview is active. The public link remains locked until the birthday.';
      unlockBtn.hidden = false;
      unlockBtn.textContent = 'Open private preview ✧';
      countdown.hidden = true;
      return;
    }
    const remaining = UNLOCK_AT - Date.now();
    if (remaining <= 0) {
      countdown.hidden = true;
      $('lockHint').textContent = 'The moment is here. Your surprise is ready.';
      unlockBtn.hidden = false;
      return;
    }
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    $('days').textContent = String(days).padStart(2, '0');
    $('hours').textContent = String(hours).padStart(2, '0');
    $('minutes').textContent = String(minutes).padStart(2, '0');
    $('seconds').textContent = String(seconds).padStart(2, '0');
  }
  updateCountdown();
  const countdownTimer = window.setInterval(() => {
    updateCountdown();
    if (Date.now() >= UNLOCK_AT && !PREVIEW_MODE) window.clearInterval(countdownTimer);
  }, 1000);
  unlockBtn.addEventListener('click', () => {
    if (!PREVIEW_MODE && Date.now() < UNLOCK_AT) return;
    unlockedByVisitor = true;
    showBirthday();
  });

  const audio = $('birthdayAudio');
  const musicBtn = $('musicBtn');
  const musicLabel = $('musicLabel');
  async function tryPlayMusic() {
    try { await audio.play(); musicLabel.textContent = 'Pause music'; musicBtn.setAttribute('aria-label', 'Pause birthday music'); }
    catch (_) { musicLabel.textContent = 'Play music'; musicBtn.setAttribute('aria-label', 'Play birthday music'); }
  }
  musicBtn.addEventListener('click', async () => {
    if (audio.paused) await tryPlayMusic();
    else { audio.pause(); musicLabel.textContent = 'Play music'; musicBtn.setAttribute('aria-label', 'Play birthday music'); }
  });
  audio.addEventListener('play', () => { musicLabel.textContent = 'Pause music'; });
  audio.addEventListener('pause', () => { musicLabel.textContent = 'Play music'; });
  document.addEventListener('visibilitychange', () => {
    // Do not force background playback. If the browser pauses audio, the control lets the visitor resume.
    if (!document.hidden && !audio.paused) musicLabel.textContent = 'Pause music';
  });

  
const letterModal = $('letterModal');
const closeLetterModal = $('closeLetterModal');

function openLetterModal() {
  $('envelope').classList.add('open');

  letterModal.classList.add('show');
  letterModal.setAttribute('aria-hidden', 'false');

  document.body.classList.add('letter-open');
  $('letterHint').textContent = 'Your letter is open ♡';
}

function closeLetter() {
  letterModal.classList.remove('show');
  letterModal.setAttribute('aria-hidden', 'true');

  document.body.classList.remove('letter-open');
  $('envelope').classList.remove('open');

  $('letterHint').textContent = 'Tap the seal to open your letter';
}

$('sealBtn').addEventListener('click', openLetterModal);

closeLetterModal.addEventListener('click', closeLetter);

letterModal.addEventListener('click', (event) => {
  if (event.target === letterModal) {
    closeLetter();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && letterModal.classList.contains('show')) {
    closeLetter();
  }
});


  let candlesOut = 0;
  document.querySelectorAll('.candle').forEach((candle) => {
    candle.addEventListener('click', () => {
      if (candle.classList.contains('off')) return;
      candle.classList.add('off');
      candle.setAttribute('aria-label', 'Candle extinguished');
      candlesOut++;
      if (candlesOut === 1) $('wishMessage').textContent = 'One wish sent into the universe…';
      else if (candlesOut === 2) $('wishMessage').textContent = 'Two wishes. One more to go…';
      else { $('wishMessage').textContent = 'All three wishes are yours. May they find their way! ✨'; burstConfetti(100); }
    });
  });

  document.querySelectorAll('.note-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      card.setAttribute('aria-expanded', String(card.classList.contains('flipped')));
    });
  });

  const lightbox = $('lightbox');
  const lightboxImage = $('lightboxImage');
  document.querySelectorAll('.photo-card').forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      $('lightboxCaption').textContent = card.querySelector('figcaption').textContent;
      lightbox.classList.add('show');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });
  function closeLightbox() { lightbox.classList.remove('show'); lightbox.setAttribute('aria-hidden', 'true'); lightboxImage.removeAttribute('src'); }
  $('closeLightbox').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

  $('giftBtn').addEventListener('click', () => {
    const gift = $('giftBtn');
    gift.classList.add('open');
    $('finalMessage').hidden = false;
    gift.setAttribute('aria-label', 'Birthday gift opened');
    burstConfetti(190);
    $('finalMessage').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  let observer;
  function startRevealObserver() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach(item => item.classList.add('visible')); return; }
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
    items.forEach(item => observer.observe(item));
  }

  const canvas = $('celebration');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resizeCanvas() { const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  window.addEventListener('resize', resizeCanvas); resizeCanvas();
  function burstConfetti(amount) {
    const colors = ['#e8c58d', '#d995a8', '#f6e4d3', '#a86d83', '#f1bd79'];
    for (let i = 0; i < amount; i++) particles.push({ x: innerWidth * (.2 + Math.random() * .6), y: innerHeight * .25 + Math.random() * 100, vx: (Math.random() - .5) * 7, vy: Math.random() * -7 - 2, gravity: .12 + Math.random() * .08, size: 2 + Math.random() * 4, color: colors[Math.floor(Math.random() * colors.length)], life: 100 + Math.random() * 70, rotation: Math.random() * 6, spin: (Math.random() - .5) * .18 });
    if (particles.length > 650) particles.splice(0, particles.length - 650);
  }
  function animateConfetti() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles = particles.filter(p => p.life > 0 && p.y < innerHeight + 30);
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= .995; p.rotation += p.spin; p.life--; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, p.life / 30); ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size); ctx.restore(); });
    requestAnimationFrame(animateConfetti);
  }
  animateConfetti();
})();
