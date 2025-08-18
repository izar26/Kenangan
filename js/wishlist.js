// ==========================
// FITUR WISHLIST
// ==========================
// File ini mengatur semua logika untuk daftar keinginan bersama.

// --- Fungsi Tampilan ---
function renderWishlistUI() {
    // Selalu cari elemen ini setiap kali merender, untuk memastikan selalu ada.
    const wishlistContainer = document.getElementById('wishlistContainer');
    if (!wishlistContainer) {
        console.error("Gagal menemukan wishlistContainer saat merender.");
        return; 
    }

    wishlistContainer.innerHTML = '';
    if (appData.wishlist && appData.wishlist.length > 0) {
        const sortedWishlist = [...appData.wishlist].sort((a, b) => a.done - b.done);
        sortedWishlist.forEach(wish => {
            const item = document.createElement('div');
            item.className = 'wish-item';
            item.dataset.id = wish.id;
            if (wish.done) {
                item.classList.add('done');
            }
            item.innerHTML = `
                <input type="checkbox" class="wish-checkbox" ${wish.done ? 'checked' : ''}>
                <span class="wish-text">${wish.text}</span>
                <button class="delete-wish-btn">×</button>
            `;
            wishlistContainer.appendChild(item);
        });
    } else {
        wishlistContainer.innerHTML = `<p style="text-align: center;">Belum ada impian. Tulis satu yuk!</p>`;
    }
}

// --- Inisialisasi Event Listeners ---
function setupWishlist() {
    // Cari elemen-elemen PENTING di sini, setelah halaman dijamin sudah dimuat.
    const wishlistContainer = document.getElementById('wishlistContainer');
    const wishlistInput = document.getElementById('wishlistInput');
    const addWishBtn = document.getElementById('addWishBtn');

    // Jika salah satu elemen penting tidak ada, hentikan fungsi untuk mencegah error.
    if (!wishlistContainer || !wishlistInput || !addWishBtn) {
        console.error("Salah satu elemen Wishlist tidak ditemukan. Fitur tidak akan berjalan.");
        return;
    }

    addWishBtn.addEventListener('click', async () => {
        const text = wishlistInput.value.trim();
        if (text) {
            const newWish = {
                id: Date.now(),
                text: text,
                done: false
            };
            
            // Pengaman: Pastikan appData.wishlist adalah sebuah array
            if (!Array.isArray(appData.wishlist)) {
                appData.wishlist = [];
            }

            appData.wishlist.unshift(newWish);
            await saveData();
            renderWishlistUI();
            wishlistInput.value = '';
        }
    });

    wishlistContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const wishItem = target.closest('.wish-item');
        if (!wishItem) return;

        const wishId = Number(wishItem.dataset.id);
        // Pastikan appData.wishlist adalah array sebelum mencari
        if (!Array.isArray(appData.wishlist)) return;
        
        const wishIndex = appData.wishlist.findIndex(w => w.id === wishId);
        if (wishIndex === -1) return;

        let dataChanged = false;

        if (target.classList.contains('wish-checkbox')) {
            appData.wishlist[wishIndex].done = target.checked;
            dataChanged = true;
        }

        if (target.classList.contains('delete-wish-btn')) {
            if (confirm("Hapus impian ini?")) {
                appData.wishlist.splice(wishIndex, 1);
                dataChanged = true;
            }
        }

        if (dataChanged) {
            await saveData();
            renderWishlistUI();
        }
    });
}
