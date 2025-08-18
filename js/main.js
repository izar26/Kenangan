// ==========================
// FILE UTAMA (SUTRADARA)
// ==========================
// File ini bertanggung jawab untuk menjalankan semua fitur aplikasi
// dalam urutan yang benar.

// Fungsi ini akan berjalan setelah seluruh halaman HTML dimuat
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Muat semua data dari database online terlebih dahulu
  await loadData();

  // 2. Setelah data siap, tampilkan semua elemen di layar
  renderTimelineUI();
  renderWishlistUI();
  renderNotesUI();
  setCountdownUI();
  syncHero(); // Tampilkan foto acak di halaman utama

  // 3. Setelah semua tampil, pasang semua 'otak' (event listener)
  setupNavigation();
  setupPetalsAnimation();
  setupTimeline();
  setupWishlist();
  setupCountdown();
  setupNotes();
  setupMusic();

  // 4. Jalankan fitur dinamis yang butuh data
  getWeatherGreeting();
  randomNote(); // Tampilkan note acak pertama kali
  setupOnThisDay(); // <-- JALANKAN FITUR KILAS BALIK BARU

  console.log("Aplikasi 'Cerita Kita' berhasil dimuat dan siap digunakan!💖");
});
