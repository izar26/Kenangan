// ==========================
// KONFIGURASI APLIKASI
// ==========================
const BIN_ID = '689ff25743b1c97be91f6f54';
const API_KEY = '$2a$10$GRt3jpAEm73LBDcxrEbF7OKiHLVp5DYdCYIWktCSOWoTOPXSZvoZy';
const CLOUD_NAME = "djfw245ka";
const UPLOAD_PRESET = "Kenangan";

const binUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const headers = { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY };

let appData = { gallery: [], countdown: { date: null, title: "" }, notes: [] };

// ==========================
// FUNGSI UTAMA DATA (JSONBIN.IO)
// ==========================
async function loadData() {
  try {
    const response = await fetch(`${binUrl}/latest`, { headers });
    if (!response.ok) throw new Error("Gagal mengambil data dari bin.");
    const data = await response.json();
    appData = data.record;

    if (appData.gallery && appData.gallery.length > 0 && !appData.gallery[0].date) {
        console.log("Mendeteksi format galeri lama, melakukan migrasi...");
        const today = new Date().toISOString().split('T')[0];
        appData.gallery.forEach(photo => {
            photo.date = today;
        });
        await saveData();
    }

    renderTimelineUI();
    setCountdownUI();
    renderNotesUI();
    syncHero();
  } catch (error) { console.error("Error loading data:", error); }
}

async function saveData() {
  try {
    document.body.style.cursor = 'wait';
    await fetch(binUrl, { method: 'PUT', headers: headers, body: JSON.stringify(appData) });
  } catch (error) { console.error("Error saving data:", error); } 
  finally { document.body.style.cursor = 'default'; }
}

// ... (Kode dari SPA Navigation sampai Countdown tidak berubah) ...
const sections = Array.from(document.querySelectorAll('section'));
const navButtons = Array.from(document.querySelectorAll('.nav button'));
function show(id) { sections.forEach(s => s.classList.toggle('show', s.id === id)); navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === id)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
document.getElementById('nav').addEventListener('click', (e) => { const btn = e.target.closest('button'); if (!btn) return; const target = btn.dataset.target; if (target) show(target); });
document.querySelectorAll('.hero-cta [data-target]').forEach(btn => btn.addEventListener('click', () => show(btn.dataset.target)));
const petals = document.getElementById('petals');
const PETALS = ['🌸', '🌷', '💮', '🌺', '🩷'];
function spawnPetal(customX) { const el = document.createElement('div'); el.className = 'petal'; el.textContent = PETALS[Math.floor(Math.random() * PETALS.length)]; const startX = (customX ?? Math.random() * 100); const drift = (Math.random() * 60 - 30) + 'vw'; const rot = (Math.random() * 720 - 360) + 'deg'; const dur = (10 + Math.random() * 8).toFixed(1) + 's'; el.style.left = startX + 'vw'; el.style.setProperty('--x', drift); el.style.setProperty('--rot', rot); el.style.setProperty('--dur', dur); petals.appendChild(el); setTimeout(() => el.remove(), parseFloat(dur) * 1000); }
setInterval(() => spawnPetal(), 900);
document.querySelector('[data-action="burst"]').addEventListener('click', () => { for (let i = 0; i < 40; i++) setTimeout(() => spawnPetal(50 + (Math.random() * 40 - 20)), i * 30); });
const dateInput = document.getElementById('dateInput');
const titleInput = document.getElementById('titleInput');
const saveDate = document.getElementById('saveDate');
const titleOut = document.getElementById('titleOut');
const dEl = document.getElementById('d'); const hEl = document.getElementById('h'); const mEl = document.getElementById('m'); const sEl = document.getElementById('s');
function setCountdownUI() { const data = appData.countdown; if (!data || !data.date) { titleOut.textContent = '—'; return; } titleOut.textContent = data.title ? `${data.title} • ${new Date(data.date).toLocaleDateString()}` : new Date(data.date).toLocaleDateString(); dateInput.value = data.date.slice(0, 10); titleInput.value = data.title || ''; }
saveDate.addEventListener('click', async () => { if (!dateInput.value) { alert('Pilih tanggal dulu ya!'); return; } appData.countdown = { date: new Date(dateInput.value).toISOString(), title: titleInput.value.trim() }; await saveData(); setCountdownUI(); alert('Tanggal spesial berhasil disimpan!'); });
function tick() { const data = appData.countdown; if (!data || !data.date) { dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '0'; return; } const now = new Date(); const target = new Date(data.date); let diff = Math.max(0, target - now); const s = Math.floor(diff / 1000) % 60; const m = Math.floor(diff / 1000 / 60) % 60; const h = Math.floor(diff / 1000 / 60 / 60) % 24; const d = Math.floor(diff / 1000 / 60 / 60 / 24); dEl.textContent = d; hEl.textContent = h; mEl.textContent = m; sEl.textContent = s; }

// ==========================
// TIMELINE (LOGIKA BARU)
// ==========================
const timelineContainer = document.getElementById('timelineContainer');
const addPhotoBtn = document.getElementById('addPhotoBtn');
const randomMemoryBtn = document.getElementById('randomMemoryBtn'); // Tombol baru
const photoUploader = document.getElementById('photoUploader');
const closeUploaderBtn = document.getElementById('closeUploaderBtn');
const photoFileInput = document.getElementById('photoFileInput');
const photoPreview = document.getElementById('photoPreview');
const photoDateInput = document.getElementById('photoDateInput');
const photoLabelInput = document.getElementById('photoLabelInput');
const savePhotoBtn = document.getElementById('savePhotoBtn');
const LB = document.getElementById('lightbox');
const LBimg = LB.querySelector('img');
const deleteBtn = document.getElementById('deleteBtn');
let currentImageInLightbox = null;
let selectedFile = null;

function openLightbox(photo) {
    LBimg.src = photo.url;
    LB.classList.add('show');
    currentImageInLightbox = photo;
}

function closeLightbox() {
    LB.classList.remove('show');
}

function renderTimelineUI() {
    timelineContainer.innerHTML = '';
    if (appData.gallery && appData.gallery.length > 0) {
        const sortedGallery = [...appData.gallery].sort((a, b) => new Date(b.date) - new Date(a.date));
        sortedGallery.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            const date = new Date(photo.date);
            const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            item.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-date">${formattedDate}</div>
                    <h3>${photo.label}</h3>
                    <img src="${photo.url}" alt="${photo.label}" class="timeline-photo">
                </div>
            `;
            item.querySelector('.timeline-photo').addEventListener('click', () => openLightbox(photo));
            timelineContainer.appendChild(item);
        });
    } else {
        timelineContainer.innerHTML = `<p style="text-align: center;">Belum ada kenangan. Tambahkan satu yuk!</p>`;
    }
}

function openUploader() {
    selectedFile = null;
    photoPreview.src = '';
    photoPreview.classList.remove('show');
    photoDateInput.value = new Date().toISOString().split('T')[0];
    photoLabelInput.value = '';
    photoUploader.classList.add('show');
}

function closeUploader() {
    photoUploader.classList.remove('show');
}

addPhotoBtn.addEventListener('click', openUploader);
closeUploaderBtn.addEventListener('click', closeUploader);
LB.addEventListener('click', (e) => {
    if (e.target === LB) {
        closeLightbox();
    }
});

// --- LOGIKA BARU UNTUK KENANGAN ACAK ---
randomMemoryBtn.addEventListener('click', () => {
    if (appData.gallery && appData.gallery.length > 0) {
        const randomIndex = Math.floor(Math.random() * appData.gallery.length);
        const randomPhoto = appData.gallery[randomIndex];
        openLightbox(randomPhoto);
    } else {
        alert("Kamu belum punya kenangan untuk ditampilkan secara acak. Tambahkan dulu yuk!");
    }
});

photoFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            photoPreview.src = event.target.result;
            photoPreview.classList.add('show');
        };
        reader.readAsDataURL(file);
    }
});

savePhotoBtn.addEventListener('click', async () => {
    if (!selectedFile) { alert("Pilih foto dulu ya!"); return; }
    if (!photoDateInput.value) { alert("Pilih tanggal kenangannya ya!"); return; }
    if (!photoLabelInput.value) { alert("Beri judul kenangannya ya!"); return; }
    savePhotoBtn.textContent = 'Mengunggah...';
    savePhotoBtn.disabled = true;
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
    const data = await res.json();
    const newMemory = {
        url: data.secure_url,
        id: data.public_id,
        label: photoLabelInput.value,
        date: photoDateInput.value
    };
    appData.gallery.push(newMemory);
    await saveData();
    renderTimelineUI();
    closeUploader();
    savePhotoBtn.textContent = 'Simpan Kenangan';
    savePhotoBtn.disabled = false;
});

deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (currentImageInLightbox && confirm("Hapus kenangan ini?")) {
        appData.gallery = appData.gallery.filter(it => it.id !== currentImageInLightbox.id);
        await saveData();
        renderTimelineUI();
        closeLightbox();
        currentImageInLightbox = null;
    }
});

// ... (Kode dari LOVE NOTES sampai akhir tidak berubah) ...
const typeEl = document.getElementById('typewriter');
const randomBtn = document.getElementById('randomBtn');
const copyBtn = document.getElementById('copyBtn');
const noteInput = document.getElementById('noteInput');
const addNote = document.getElementById('addNote');
const noteList = document.getElementById('noteList');
function renderNotesUI() { noteList.innerHTML = ''; if (appData.notes && appData.notes.length > 0) { appData.notes.forEach((noteText, index) => { const chip = document.createElement('div'); chip.className = 'chip'; chip.innerHTML = `<span>${noteText}</span><button class="delete-chip-btn" data-index="${index}">×</button>`; chip.title = 'Klik untuk tampilkan'; chip.querySelector('span').addEventListener('click', () => typeText(noteText)); chip.querySelector('.delete-chip-btn').addEventListener('click', async (e) => { e.stopPropagation(); if(!confirm("Hapus catatan ini?")) return; appData.notes.splice(index, 1); await saveData(); renderNotesUI(); }); noteList.appendChild(chip); }); } else { noteList.innerHTML = `<p style="text-align: center; color: var(--muted);">Belum ada catatan cinta.</p>`; } }
function typeText(text) { typeEl.textContent = ''; let i = 0; if (window.typewriterInterval) clearInterval(window.typewriterInterval); window.typewriterInterval = setInterval(() => { typeEl.textContent = text.slice(0, i++); if (i > text.length) { clearInterval(window.typewriterInterval); } }, 18); }
function randomNote() { if (!appData.notes || appData.notes.length === 0) { typeText("Belum ada catatan cinta... Tambahkan satu yuk!"); return; } const pick = appData.notes[Math.floor(Math.random() * appData.notes.length)]; typeText(pick); }
randomBtn.addEventListener('click', randomNote);
copyBtn.addEventListener('click', async () => { const text = typeEl.textContent.trim(); if (!text || text === '—') return alert('Belum ada teks untuk disalin'); await navigator.clipboard.writeText(text); copyBtn.textContent = 'Tersalin ✔'; setTimeout(() => copyBtn.textContent = 'Salin', 1200); });
addNote.addEventListener('click', async () => { const v = noteInput.value.trim(); if (!v) return; if (!appData.notes.includes(v)) { appData.notes.unshift(v); } await saveData(); renderNotesUI(); noteInput.value = ''; typeText(v); });
const musicToggleBtn = document.getElementById('musicToggleBtn');
const synth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "fmsine", modulationType: "sine", modulationIndex: 3, harmonicity: 3.4 }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.4 } }).toDestination();
synth.volume.value = -12;
const melody = [ {'time': '0:0', 'note': 'C4', 'duration': '4n'}, {'time': '0:1', 'note': 'C4', 'duration': '4n'}, {'time': '0:2', 'note': 'G4', 'duration': '4n'}, {'time': '0:3', 'note': 'G4', 'duration': '4n'}, {'time': '1:0', 'note': 'A4', 'duration': '4n'}, {'time': '1:1', 'note': 'A4', 'duration': '4n'}, {'time': '1:2', 'note': 'G4', 'duration': '2n'}, {'time': '2:0', 'note': 'F4', 'duration': '4n'}, {'time': '2:1', 'note': 'F4', 'duration': '4n'}, {'time': '2:2', 'note': 'E4', 'duration': '4n'}, {'time': '2:3', 'note': 'E4', 'duration': '4n'}, {'time': '3:0', 'note': 'D4', 'duration': '4n'}, {'time': '3:1', 'note': 'D4', 'duration': '4n'}, {'time': '3:2', 'note': 'C4', 'duration': '2n'}, ];
const loopDuration = '4m'; const tempo = 100;
const part = new Tone.Part((time, value) => { synth.triggerAttackRelease(value.note, value.duration, time); }, melody).start(0);
part.loop = true; part.loopEnd = loopDuration; Tone.Transport.bpm.value = tempo;
let isMusicPlaying = false; let isAudioReady = false;
musicToggleBtn.addEventListener('click', async () => { if (!isAudioReady) { await Tone.start(); isAudioReady = true; } if (isMusicPlaying) { Tone.Transport.pause(); musicToggleBtn.textContent = '🎵'; isMusicPlaying = false; } else { Tone.Transport.start(); musicToggleBtn.textContent = '🔇'; isMusicPlaying = true; } });
const weatherGreetingEl = document.getElementById('weatherGreeting');
const mainGreetingEl = document.getElementById('mainGreeting');
function getWeatherGreeting() { if (!navigator.geolocation) { weatherGreetingEl.textContent = "Semoga harimu indah, ya!"; return; } navigator.geolocation.getCurrentPosition(async (position) => { const { latitude: lat, longitude: lon } = position.coords; try { const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`); const weatherData = await response.json(); const weatherCode = weatherData.current_weather.weathercode; let greeting = "Semoga harimu seindah dirimu! ✨"; if ([0, 1].includes(weatherCode)) greeting = "Cerah ya hari ini, secerah senyummu! ☀️"; else if ([2, 3].includes(weatherCode)) greeting = "Sedikit berawan, tapi cintaku padamu selalu cerah! 🌥️"; else if ([45, 48].includes(weatherCode)) greeting = "Di luar berkabut, pas buat pelukan hangat. 🤗"; else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) greeting = "Lagi gerimis manja, enaknya sambil minum teh bareng kamu. 🌧️"; else if ([95, 96, 99].includes(weatherCode)) greeting = "Ada badai di luar, tapi di sini aman bersamamu. ⛈️"; weatherGreetingEl.textContent = greeting; mainGreetingEl.textContent = "Hai, Sayang"; } catch (error) { console.error("Gagal mengambil data cuaca:", error); weatherGreetingEl.textContent = "Semoga harimu indah, ya!"; } }, () => { weatherGreetingEl.textContent = "Semoga harimu indah, ya!"; }); }
function syncHero() { if (appData.gallery && appData.gallery.length > 0) { const randomIndex = Math.floor(Math.random() * appData.gallery.length); document.getElementById('heroPhoto').src = appData.gallery[randomIndex].url; } }
loadData().then(() => { console.log("Data berhasil dimuat. Aplikasi siap digunakan!"); getWeatherGreeting(); randomNote(); setInterval(tick, 1000); });
