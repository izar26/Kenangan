// ==========================
// MANAJEMEN DATA (JSONBIN.IO)
// ==========================
// File ini mengurus semua fungsi untuk memuat dan menyimpan data ke database.

const binUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY
};

// Objek utama untuk menyimpan semua data aplikasi
let appData = {
  gallery: [],
  wishlist: [],
  countdown: { date: null, title: "" },
  notes: []
};

// Fungsi untuk MEMBACA semua data dari JSONBin
async function loadData() {
  try {
    const response = await fetch(`${binUrl}/latest`, { headers });
    if (!response.ok) throw new Error("Gagal mengambil data dari bin.");
    const data = await response.json();
    appData = data.record;

    // Inisialisasi data kosong jika belum ada di database
    if (!appData.gallery) appData.gallery = [];
    if (!appData.wishlist) appData.wishlist = [];
    if (!appData.countdown) appData.countdown = { date: null, title: "" };
    if (!appData.notes) appData.notes = [];

  } catch (error) {
    console.error("Error loading data:", error);
    // Jika gagal memuat, setidaknya aplikasi tidak rusak
    // dan bisa berjalan dengan data kosong.
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
