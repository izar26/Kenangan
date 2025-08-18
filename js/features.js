// ==========================
// FITUR-FITUR TAMBAHAN
// ==========================
// File ini berisi logika untuk fitur-fitur spesial aplikasi.

// --- FITUR 1: COUNTDOWN ---
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
    dEl.textContent = d;
    hEl.textContent = h;
    mEl.textContent = m;
    sEl.textContent = s;
}

function setupCountdown() {
    saveDate.addEventListener('click', async () => {
        if (!dateInput.value) {
            alert('Pilih tanggal dulu ya!');
            return;
        }
        appData.countdown = {
            date: new Date(dateInput.value).toISOString(),
            title: titleInput.value.trim()
        };
        await saveData();
        setCountdownUI();
        alert('Tanggal spesial berhasil disimpan!');
    });
    setInterval(tick, 1000);
}


// --- FITUR 2: LOVE NOTES ---
const typeEl = document.getElementById('typewriter');
const randomBtn = document.getElementById('randomBtn');
const copyBtn = document.getElementById('copyBtn');
const noteInput = document.getElementById('noteInput');
const addNote = document.getElementById('addNote');
const noteList = document.getElementById('noteList');

function renderNotesUI() {
    noteList.innerHTML = '';
    if (appData.notes && appData.notes.length > 0) {
        appData.notes.forEach((noteText, index) => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `<span>${noteText}</span><button class="delete-chip-btn" data-index="${index}">×</button>`;
            chip.querySelector('span').addEventListener('click', () => typeText(noteText));
            chip.querySelector('.delete-chip-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm("Hapus catatan ini?")) {
                    appData.notes.splice(index, 1);
                    await saveData();
                    renderNotesUI();
                }
            });
            noteList.appendChild(chip);
        });
    } else {
        noteList.innerHTML = `<p style="text-align: center; color: var(--muted);">Belum ada catatan cinta.</p>`;
    }
}

function typeText(text) {
    typeEl.textContent = '';
    let i = 0;
    if (window.typewriterInterval) clearInterval(window.typewriterInterval);
    window.typewriterInterval = setInterval(() => {
        typeEl.textContent = text.slice(0, i++);
        if (i > text.length) {
            clearInterval(window.typewriterInterval);
        }
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

function setupNotes() {
    randomBtn.addEventListener('click', randomNote);
    copyBtn.addEventListener('click', async () => {
        const text = typeEl.textContent.trim();
        if (!text || text === '—') return alert('Belum ada teks untuk disalin');
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Tersalin ✔';
        setTimeout(() => copyBtn.textContent = 'Salin', 1200);
    });
    addNote.addEventListener('click', async () => {
        const v = noteInput.value.trim();
        if (!v) return;
        if (!appData.notes.includes(v)) {
            appData.notes.unshift(v);
        }
        await saveData();
        renderNotesUI();
        noteInput.value = '';
        typeText(v);
    });
}


// --- FITUR 3: MUSIK LATAR ---
const musicToggleBtn = document.getElementById('musicToggleBtn');
let synth, part, isMusicPlaying = false, isAudioReady = false;

function setupMusic() {
    synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "fmsine", modulationType: "sine", modulationIndex: 3, harmonicity: 3.4 },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.4 }
    }).toDestination();
    synth.volume.value = -12;

    const melody = [
        {'time': '0:0', 'note': 'C4', 'duration': '4n'}, {'time': '0:1', 'note': 'C4', 'duration': '4n'},
        {'time': '0:2', 'note': 'G4', 'duration': '4n'}, {'time': '0:3', 'note': 'G4', 'duration': '4n'},
        {'time': '1:0', 'note': 'A4', 'duration': '4n'}, {'time': '1:1', 'note': 'A4', 'duration': '4n'},
        {'time': '1:2', 'note': 'G4', 'duration': '2n'},
        {'time': '2:0', 'note': 'F4', 'duration': '4n'}, {'time': '2:1', 'note': 'F4', 'duration': '4n'},
        {'time': '2:2', 'note': 'E4', 'duration': '4n'}, {'time': '2:3', 'note': 'E4', 'duration': '4n'},
        {'time': '3:0', 'note': 'D4', 'duration': '4n'}, {'time': '3:1', 'note': 'D4', 'duration': '4n'},
        {'time': '3:2', 'note': 'C4', 'duration': '2n'},
    ];
    
    part = new Tone.Part((time, value) => {
        synth.triggerAttackRelease(value.note, value.duration, time);
    }, melody).start(0);
    part.loop = true;
    part.loopEnd = '4m';
    Tone.Transport.bpm.value = 100;

    musicToggleBtn.addEventListener('click', async () => {
        if (!isAudioReady) {
            await Tone.start();
            isAudioReady = true;
        }
        if (isMusicPlaying) {
            Tone.Transport.pause();
            musicToggleBtn.textContent = '🎵';
            isMusicPlaying = false;
        } else {
            Tone.Transport.start();
            musicToggleBtn.textContent = '🔇';
            isMusicPlaying = true;
        }
    });
}


// --- FITUR 4: SAPAAN CUACA ---
const weatherGreetingEl = document.getElementById('weatherGreeting');
const mainGreetingEl = document.getElementById('mainGreeting');

function getWeatherGreeting() {
    if (!navigator.geolocation) {
        weatherGreetingEl.textContent = "Semoga harimu indah, ya!";
        return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const weatherData = await response.json();
            const weatherCode = weatherData.current_weather.weathercode;
            let greeting = "Semoga harimu seindah dirimu! ✨";
            if ([0, 1].includes(weatherCode)) greeting = "Cerah ya hari ini, secerah senyummu! ☀️";
            else if ([2, 3].includes(weatherCode)) greeting = "Sedikit berawan, tapi cintaku padamu selalu cerah! 🌥️";
            else if ([45, 48].includes(weatherCode)) greeting = "Di luar berkabut, pas buat pelukan hangat. 🤗";
            else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) greeting = "Lagi gerimis manja, enaknya sambil minum teh bareng kamu. 🌧️";
            else if ([95, 96, 99].includes(weatherCode)) greeting = "Ada badai di luar, tapi di sini aman bersamamu. ⛈️";
            weatherGreetingEl.textContent = greeting;
            mainGreetingEl.textContent = "Hai, Sayang";
        } catch (error) {
            weatherGreetingEl.textContent = "Semoga harimu indah, ya!";
        }
    }, () => {
        weatherGreetingEl.textContent = "Semoga harimu indah, ya!";
    });
}


// --- FITUR 5: FOTO UTAMA ACAK ---
function syncHero() {
    if (appData.gallery && appData.gallery.length > 0) {
        const randomIndex = Math.floor(Math.random() * appData.gallery.length);
        document.getElementById('heroPhoto').src = appData.gallery[randomIndex].url;
    }
}
