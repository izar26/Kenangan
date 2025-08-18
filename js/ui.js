// ==========================
// FUNGSI TAMPILAN UMUM (UI)
// ==========================
// File ini mengatur interaksi dasar dan elemen visual umum.

// --- Navigasi Halaman ---
const sections = Array.from(document.querySelectorAll('section'));
const navButtons = Array.from(document.querySelectorAll('.nav button'));

function show(id) {
  sections.forEach(s => s.classList.toggle('show', s.id === id));
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupNavigation() {
  const nav = document.getElementById('nav');
  if (nav) {
    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn && btn.dataset.target) {
        show(btn.dataset.target);
      }
    });
  }

  // Juga fungsikan tombol CTA (Call to Action) di halaman utama
  document.querySelectorAll('.hero-cta [data-target]').forEach(btn => {
    btn.addEventListener('click', () => show(btn.dataset.target));
  });
}


// --- Animasi Kelopak Bunga ---
const petalsContainer = document.getElementById('petals');
const PETALS = ['🌸', '🌷', '💮', '🌺', '🩷'];

function spawnPetal(customX) {
  if (!petalsContainer) return;
  const el = document.createElement('div');
  el.className = 'petal';
  el.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];
  
  const startX = (customX ?? Math.random() * 100);
  const drift = (Math.random() * 60 - 30) + 'vw';
  const rot = (Math.random() * 720 - 360) + 'deg';
  const dur = (10 + Math.random() * 8).toFixed(1) + 's';

  el.style.left = startX + 'vw';
  el.style.setProperty('--x', drift);
  el.style.setProperty('--rot', rot);
  el.style.setProperty('--dur', dur);

  petalsContainer.appendChild(el);
  setTimeout(() => el.remove(), parseFloat(dur) * 1000);
}

function setupPetalsAnimation() {
  // Hujan kelopak bunga terus-menerus
  setInterval(() => spawnPetal(), 900);

  // Fungsi untuk tombol "Taburkan Bunga"
  const burstBtn = document.querySelector('[data-action="burst"]');
  if (burstBtn) {
    burstBtn.addEventListener('click', () => {
      for (let i = 0; i < 40; i++) {
        setTimeout(() => spawnPetal(50 + (Math.random() * 40 - 20)), i * 30);
      }
    });
  }
}
