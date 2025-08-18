const CACHE_NAME = 'untuk-kamu-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Poppins:wght@400;600;700&family=Caveat&family=Merriweather&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js'
];

// Event install: Buka cache dan simpan file-file utama
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event fetch: Cek apakah permintaan ada di cache, jika tidak, ambil dari jaringan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, kembalikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak, ambil dari jaringan
        return fetch(event.request);
      }
    )
  );
});
