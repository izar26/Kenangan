// ==========================
// KONFIGURASI APLIKASI & JSONBIN
// ==========================
const BIN_ID = '689ff25743b1c97be91f6f54';
const API_KEY = '$2a$10$GRt3jpAEm73LBDcxrEbF7OKiHLVp5DYdCYIWktCSOWoTOPXSZvoZy';
const CLOUD_NAME = "djfw245ka"; // <-- GANTI JIKA PERLU
const UPLOAD_PRESET = "Kenangan"; // <-- GANTI JIKA PERLU

const binUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY
};

// Variabel global untuk menyimpan semua data aplikasi
let appData = {
  gallery: [],
  countdown: { date: null, title: "" },
  notes: []
};

// ==========================
// FUNGSI UTAMA DATA (JSONBIN.IO)
// ==========================

// Fungsi untuk MEMBACA semua data dari JSONBin
async function loadData() {
  try {
    const response = await fetch(`${binUrl}/latest`, { headers });
    if (!response.ok) throw new Error("Gagal mengambil data dari bin.");
    const data = await response.json();
    appData = data.record; // Simpan data dari bin ke variabel global

    // Panggil semua fungsi untuk memperbarui tampilan setelah data didapat
    refreshGalleryUI();
    setCountdownUI();
    renderNotesUI();
    syncHero();
  } catch (error) {
    console.error("Error loading data:", error);
    alert("Tidak bisa memuat data. Periksa koneksi atau konfigurasi Bin.");
  }
}

// Fungsi untuk MENYIMPAN semua data ke JSONBin
async function saveData() {
  try {
    document.body.style.cursor = 'wait';
    await fetch(binUrl, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(appData)
    });
  } catch (error) {
    console.error("Error saving data:", error);
    alert("Gagal menyimpan data.");
  } finally {
    document.body.style.cursor = 'default';
  }
}

// ==========================
// SPA Navigation
// ==========================
const sections = Array.from(document.querySelectorAll('section'));
const navButtons = Array.from(document.querySelectorAll('.nav button'));

function show(id) {
  sections.forEach(s => s.classList.toggle('show', s.id === id));
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('nav').addEventListener('click', (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  const target = btn.dataset.target; if (target) show(target);
});
document.querySelectorAll('.hero-cta [data-target]').forEach(btn => btn.addEventListener('click', () => show(btn.dataset.target)));

// ==========================
// Petals (🌸) animation background
// ==========================
const petals = document.getElementById('petals');
const PETALS = ['🌸', '🌷', '💮', '🌺', '🩷'];

function spawnPetal(customX) {
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
  petals.appendChild(el);
  setTimeout(() => el.remove(), parseFloat(dur) * 1000);
}
setInterval(() => spawnPetal(), 900);
document.querySelector('[data-action="burst"]').addEventListener('click', () => {
  for (let i = 0; i < 40; i++) setTimeout(() => spawnPetal(50 + (Math.random() * 40 - 20)), i * 30);
});

// ==========================
// GALLERY
// ==========================
const grid = document.getElementById('galleryGrid');
const fileInput = document.getElementById('fileInput');
const uploadTile = document.getElementById('uploadTile');
const LB = document.getElementById('lightbox');
const LBimg = LB.querySelector('img');
const deleteBtn = document.getElementById('deleteBtn');

let currentImageInLightbox = null;

uploadTile.addEventListener('click', () => fileInput.click());
LB.addEventListener('click', () => LB.classList.remove('show'));

function addPhotoCard(item) {
  const wrap = document.createElement('div');
  wrap.className = 'photo';
  wrap.innerHTML = `
    <img alt="kenangan" src="${item.url}">
    <div class="tag">${item.label || ''}</div>
    <button class="delete-btn">×</button>
  `;
  
  wrap.querySelector('img').addEventListener('click', () => { 
    LBimg.src = item.url; 
    LB.classList.add('show'); 
    currentImageInLightbox = item;
  });
  
  wrap.querySelector('.delete-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!confirm("Hapus foto ini? (File di Cloudinary tetap ada)")) return;
    appData.gallery = appData.gallery.filter(it => it.id !== item.id);
    await saveData();
    refreshGalleryUI();
  });
  grid.insertBefore(wrap, uploadTile);
}

deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (currentImageInLightbox && confirm("Hapus foto ini? (File di Cloudinary tetap ada)")) {
        appData.gallery = appData.gallery.filter(it => it.id !== currentImageInLightbox.id);
        await saveData();
        refreshGalleryUI();
        LB.classList.remove('show');
        currentImageInLightbox = null;
    }
});

function refreshGalleryUI() {
  Array.from(grid.querySelectorAll('.photo')).forEach(el => { if (el !== uploadTile) el.remove(); });
  if (appData.gallery) {
    appData.gallery.forEach(item => addPhotoCard(item));
  }
}

fileInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  uploadTile.querySelector('div').innerHTML = 'Mengunggah...';

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    appData.gallery.push({ url: data.secure_url, id: data.public_id, label: file.name.replace(/\.[^.]+$/, '') });
  }

  await saveData();
  refreshGalleryUI();
  e.target.value = '';
  uploadTile.querySelector('div').innerHTML = `<div style="font-size:28px">🌷</div><div style="font-weight:700; margin-top:6px">Tambahkan Foto</div><div style="font-size:12px; color:var(--muted)">Klik di sini atau tombol di atas</div>`;
});


// ==========================
// COUNTDOWN
// ==========================
const dateInput = document.getElementById('dateInput');
const titleInput = document.getElementById('titleInput');
const saveDate = document.getElementById('saveDate');
const titleOut = document.getElementById('titleOut');
const dEl = document.getElementById('d');
const hEl = document.getElementById('h');
const mEl = document.getElementById('m');
const sEl = document.getElementById('s');

function setCountdownUI() {
  const data = appData.countdown;
  if (!data || !data.date) {
    titleOut.textContent = '—';
    return;
  }
  titleOut.textContent = data.title ? `${data.title} • ${new Date(data.date).toLocaleDateString()}` : new Date(data.date).toLocaleDateString();
  dateInput.value = data.date.slice(0, 10);
  titleInput.value = data.title || '';
}

saveDate.addEventListener('click', async () => {
  if (!dateInput.value) { alert('Pilih tanggal dulu ya!'); return; }
  appData.countdown = { date: new Date(dateInput.value).toISOString(), title: titleInput.value.trim() };
  await saveData();
  setCountdownUI();
  alert('Tanggal spesial berhasil disimpan!');
});

function tick() {
  const data = appData.countdown;
  if (!data || !data.date) {
    dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '0';
    return;
  }
  const now = new Date();
  const target = new Date(data.date);
  let diff = Math.max(0, target - now);
  const s = Math.floor(diff / 1000) % 60;
  const m = Math.floor(diff / 1000 / 60) % 60;
  const h = Math.floor(diff / 1000 / 60 / 60) % 24;
  const d = Math.floor(diff / 1000 / 60 / 60 / 24);
  dEl.textContent = d; hEl.textContent = h; mEl.textContent = m; sEl.textContent = s;
}
// JANGAN panggil setInterval di sini


// ==========================
// LOVE NOTES
// ==========================
const typeEl = document.getElementById('typewriter');
const randomBtn = document.getElementById('randomBtn');
const copyBtn = document.getElementById('copyBtn');
const noteInput = document.getElementById('noteInput');
const addNote = document.getElementById('addNote');
const noteList = document.getElementById('noteList');

function renderNotesUI() {
  noteList.innerHTML = '';
  if (appData.notes) {
    appData.notes.forEach((noteText, index) => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.innerHTML = `
        <span>${noteText}</span>
        <button class="delete-chip-btn" data-index="${index}">×</button>
      `;
      chip.title = 'Klik untuk tampilkan';
      
      chip.querySelector('span').addEventListener('click', () => typeText(noteText));
      
      chip.querySelector('.delete-chip-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        if(!confirm("Hapus catatan ini?")) return;
        appData.notes.splice(index, 1);
        await saveData();
        renderNotesUI();
      });
      noteList.appendChild(chip);
    });
  }
}

function typeText(text) {
  typeEl.textContent = '';
  let i = 0;
  if (window.typewriterInterval) clearInterval(window.typewriterInterval);
  window.typewriterInterval = setInterval(() => {
    typeEl.textContent = text.slice(0, i++);
    if (i > text.length) { clearInterval(window.typewriterInterval); }
  }, 18);
}

function randomNote() {
  if (!appData.notes || appData.notes.length === 0) {
    typeText("Belum ada catatan cinta... Tambahkan satu yuk!");
    return;
  }
  const pick = appData.notes[Math.floor(Math.random() * appData.notes.length)];
  typeText(pick);
}

randomBtn.addEventListener('click', randomNote);
copyBtn.addEventListener('click', async () => {
  const text = typeEl.textContent.trim();
  if (!text || text === '—') return alert('Belum ada teks untuk disalin');
  await navigator.clipboard.writeText(text);
  copyBtn.textContent = 'Tersalin ✔'; setTimeout(() => copyBtn.textContent = 'Salin', 1200);
});

addNote.addEventListener('click', async () => {
  const v = noteInput.value.trim(); if (!v) return;
  if (!appData.notes.includes(v)) {
    appData.notes.unshift(v);
  }
  await saveData();
  renderNotesUI();
  noteInput.value = '';
  typeText(v);
});


// ==========================
// FUNGSI KUALITAS & INISIALISASI
// ==========================
function syncHero() {
  if (appData.gallery && appData.gallery.length) {
    document.getElementById('heroPhoto').src = appData.gallery[0].url;
  }
}

// Mulai aplikasi dengan mengambil data dari JSONBin
loadData().then(() => {
    console.log("Data berhasil dimuat. Aplikasi siap digunakan!");
    randomNote();

    // *** INI BAGIAN YANG DIPERBAIKI ***
    // Mulai timer countdown SETELAH data berhasil dimuat
    setInterval(tick, 1000); 
});
