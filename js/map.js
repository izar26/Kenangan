// ==========================
// FITUR PETA KENANGAN
// ==========================
// File ini mengatur semua logika untuk Peta Kenangan Interaktif.

let map = null; // Variabel untuk menyimpan instance peta

// Fungsi untuk menginisialisasi peta (DIPERBARUI)
async function initMap() {
  // Cek apakah peta sudah dibuat sebelumnya
  if (map !== null) {
    map.remove();
  }
  
  // Buat peta baru TANPA mengatur tampilan awal
  map = L.map('mapContainer');

  // Tambahkan layer dasar peta dari OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Panggil fungsi untuk menandai kenangan dan mengatur zoom
  await plotMemoriesOnMap();
}

// Fungsi untuk mengambil koordinat dari nama lokasi menggunakan API gratis
async function getCoordsForLocation(locationName) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      // Jika lokasi ditemukan, kembalikan latitude dan longitude
      return { lat: data[0].lat, lon: data[0].lon };
    }
    return null; // Jika tidak ditemukan
  } catch (error) {
    console.error("Gagal mengambil koordinat:", error);
    return null;
  }
}

// Fungsi untuk menandai semua kenangan di peta (DIPERBARUI)
async function plotMemoriesOnMap() {
  // Jika tidak ada galeri, atur tampilan default dan hentikan
  if (!appData.gallery || appData.gallery.length === 0) {
    map.setView([-2.5489, 118.0149], 5); // Fokus ke Indonesia
    return;
  }

  // Ambil semua kenangan yang punya data lokasi
  const memoriesWithLocation = appData.gallery.filter(mem => mem.location && mem.location.trim() !== '');
  
  // Jika tidak ada kenangan berlokasi, atur tampilan default dan hentikan
  if (memoriesWithLocation.length === 0) {
    map.setView([-2.5489, 118.0149], 5); // Fokus ke Indonesia
    return;
  }

  const markerCoords = [];

  for (const memory of memoriesWithLocation) {
    const coords = await getCoordsForLocation(memory.location);
    if (coords) {
      // Buat pin (marker) di peta
      const marker = L.marker([coords.lat, coords.lon]).addTo(map);
      
      // Buat pop-up kustom yang akan muncul saat pin di-klik
      const popupContent = `
        <div class="map-popup">
          <img src="${memory.url}" alt="${memory.label}" class="map-popup-image">
          <div class="map-popup-content">
            <h4>${memory.label}</h4>
            <p>${memory.location}</p>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      markerCoords.push([coords.lat, coords.lon]);
    }
  }

  // Atur zoom peta berdasarkan pin yang ada
  if (markerCoords.length > 1) {
    // Jika ada lebih dari satu pin, paskan semua dalam layar
    const bounds = L.latLngBounds(markerCoords);
    map.fitBounds(bounds.pad(0.1)); // .pad(0.1) memberi sedikit ruang di pinggir
  } else if (markerCoords.length === 1) {
    // Jika hanya ada satu pin, zoom ke level kota
    map.setView(markerCoords[0], 13);
  }
}

// Fungsi utama yang akan dipanggil oleh main.js
function setupMap() {
    // Peta hanya diinisialisasi saat pengguna membuka tab "Peta"
    const mapNavButton = document.querySelector('button[data-target="map"]');
    if(mapNavButton){
        mapNavButton.addEventListener('click', () => {
            // Beri sedikit jeda agar kontainer peta siap
            setTimeout(() => {
                initMap();
            }, 100);
        });
    }
}
