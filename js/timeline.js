// ==========================
// FITUR TIMELINE "PERJALANAN KITA"
// ==========================
// File ini mengatur semua logika untuk galeri foto berbasis waktu.

// --- Elemen DOM ---
const timelineContainer = document.getElementById('timelineContainer');
const addPhotoBtn = document.getElementById('addPhotoBtn');
const randomMemoryBtn = document.getElementById('randomMemoryBtn');
const photoUploader = document.getElementById('photoUploader');
const closeUploaderBtn = document.getElementById('closeUploaderBtn');
const photoFileInput = document.getElementById('photoFileInput');
const photoPreview = document.getElementById('photoPreview');
const photoDateInput = document.getElementById('photoDateInput');
const photoLabelInput = document.getElementById('photoLabelInput');
const savePhotoBtn = document.getElementById('savePhotoBtn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
const deleteBtn = document.getElementById('deleteBtn');

let currentImageInLightbox = null;
let selectedFile = null;

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
        // Urutkan foto dari yang terbaru ke terlama
        const sortedGallery = [...appData.gallery].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedGallery.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            const date = new Date(photo.date);
            // Tambah 1 hari ke tanggal agar tidak ada masalah zona waktu
            date.setDate(date.getDate() + 1); 
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

// --- Fungsi Modal Uploader ---
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

// --- Inisialisasi Event Listeners ---
function setupTimeline() {
    addPhotoBtn.addEventListener('click', openUploader);
    closeUploaderBtn.addEventListener('click', closeUploader);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
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
        if (!selectedFile || !photoDateInput.value || !photoLabelInput.value) {
            alert("Harap isi semua kolom ya!");
            return;
        }
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
}
