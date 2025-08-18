// ==========================
// FITUR TIMELINE "PERJALANAN KITA"
// ==========================
// File ini mengatur semua logika untuk galeri foto berbasis waktu.

// --- Elemen DOM ---
const timelineContainer = document.getElementById('timelineContainer');
const addPhotoBtn = document.getElementById('addPhotoBtn');
const randomMemoryBtn = document.getElementById('randomMemoryBtn');
const photoUploader = document.getElementById('photoUploader');
const uploaderTitle = photoUploader.querySelector('h3');
const closeUploaderBtn = document.getElementById('closeUploaderBtn');
const photoFileInput = document.getElementById('photoFileInput');
const photoPreview = document.getElementById('photoPreview');
const photoDateInput = document.getElementById('photoDateInput');
const photoLabelInput = document.getElementById('photoLabelInput');
const photoLocationInput = document.getElementById('photoLocationInput');
const savePhotoBtn = document.getElementById('savePhotoBtn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
const deleteBtn = document.getElementById('deleteBtn');

let currentImageInLightbox = null;
let selectedFile = null;
let memoryToEdit = null; // Variabel untuk melacak item yang sedang diedit

// --- Fungsi Tampilan ---
function openLightbox(photo) {
    if (!photo) return;
    lightboxImg.src = photo.url;
    lightbox.classList.add('show');
    currentImageInLightbox = photo;
}

function closeLightbox() {
    lightbox.classList.remove('show');
}

function renderTimelineUI() {
    timelineContainer.innerHTML = '';
    if (appData.gallery && appData.gallery.length > 0) {
        const sortedGallery = [...appData.gallery].sort((a, b) => new Date(b.date) - new Date(a.date));
        sortedGallery.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            const [year, month, day] = photo.date.split('-').map(Number);
            const date = new Date(year, month - 1, day); 
            const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            item.innerHTML = `
                <div class="timeline-content">
                    <button class="edit-memory-btn">✏️</button>
                    <div class="timeline-date">${formattedDate}</div>
                    <h3>${photo.label}</h3>
                    ${photo.location ? `<p class="timeline-location">📍 ${photo.location}</p>` : ''}
                    <img src="${photo.url}" alt="${photo.label}" class="timeline-photo">
                </div>
            `;
            item.querySelector('.timeline-photo').addEventListener('click', () => openLightbox(photo));
            item.querySelector('.edit-memory-btn').addEventListener('click', () => openUploader(photo)); // Klik edit
            timelineContainer.appendChild(item);
        });
    } else {
        timelineContainer.innerHTML = `<p style="text-align: center;">Belum ada kenangan. Tambahkan satu yuk!</p>`;
    }
}

// --- Fungsi Modal Uploader (DIPERBARUI) ---
function openUploader(memory = null) {
    memoryToEdit = memory;
    if (memory) {
        // Mode Edit
        uploaderTitle.textContent = "Edit Kenangan";
        savePhotoBtn.textContent = "Simpan Perubahan";
        photoPreview.src = memory.url;
        photoPreview.classList.add('show');
        photoDateInput.value = memory.date;
        photoLabelInput.value = memory.label;
        photoLocationInput.value = memory.location || '';
        selectedFile = null; // Reset file terpilih
    } else {
        // Mode Tambah Baru
        uploaderTitle.textContent = "Tambah Kenangan Baru";
        savePhotoBtn.textContent = "Simpan Kenangan";
        selectedFile = null;
        photoPreview.src = '';
        photoPreview.classList.remove('show');
        photoDateInput.value = new Date().toISOString().split('T')[0];
        photoLabelInput.value = '';
        photoLocationInput.value = '';
    }
    photoUploader.classList.add('show');
}

function closeUploader() {
    photoUploader.classList.remove('show');
    memoryToEdit = null; // Reset mode edit
}

// --- Inisialisasi Event Listeners ---
function setupTimeline() {
    addPhotoBtn.addEventListener('click', () => openUploader()); // Buka mode tambah baru
    closeUploaderBtn.addEventListener('click', closeUploader);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    randomMemoryBtn.addEventListener('click', () => {
        if (appData.gallery && appData.gallery.length > 0) {
            const randomIndex = Math.floor(Math.random() * appData.gallery.length);
            openLightbox(appData.gallery[randomIndex]);
        } else {
            alert("Kamu belum punya kenangan untuk ditampilkan secara acak.");
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
        // Validasi dasar
        if (!photoDateInput.value || !photoLabelInput.value) {
            alert("Judul dan Tanggal tidak boleh kosong!");
            return;
        }
        if (!memoryToEdit && !selectedFile) {
            alert("Pilih foto dulu ya!");
            return;
        }

        savePhotoBtn.textContent = 'Menyimpan...';
        savePhotoBtn.disabled = true;

        if (memoryToEdit) {
            // --- LOGIKA EDIT ---
            memoryToEdit.label = photoLabelInput.value;
            memoryToEdit.date = photoDateInput.value;
            memoryToEdit.location = photoLocationInput.value.trim();
            // Cek apakah pengguna memilih foto baru untuk diganti
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("upload_preset", UPLOAD_PRESET);
                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
                const data = await res.json();
                memoryToEdit.url = data.secure_url;
                memoryToEdit.id = data.public_id;
            }
        } else {
            // --- LOGIKA TAMBAH BARU ---
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("upload_preset", UPLOAD_PRESET);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
            const data = await res.json();
            const newMemory = {
                url: data.secure_url,
                id: data.public_id,
                label: photoLabelInput.value,
                date: photoDateInput.value,
                location: photoLocationInput.value.trim()
            };
            appData.gallery.push(newMemory);
        }
        
        await saveData();
        renderTimelineUI();
        closeUploader();
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
}
