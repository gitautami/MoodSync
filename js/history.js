import { NotificationService } from './services/NotificationService.js';

const notificationService = new NotificationService();
await notificationService.init();

function getMoodEmoji(score) {
    const emojis = {
        5: '😊',
        4: '🙂',
        3: '😐',
        2: '😔',
        1: '😢'
    };
    return emojis[score] || '😐';
}

function getMoodText(score) {
    const moods = {
        5: 'Sangat Senang',
        4: 'Senang',
        3: 'Biasa Saja',
        2: 'Sedih',
        1: 'Sangat Sedih'
    };
    return moods[score] || 'Biasa Saja';
}

function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function createMoodCard(entry) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow p-6 mood-card animate__animated animate__fadeIn';
    
    const date = new Date(entry.timestamp);
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <div class="text-3xl mb-4 float-animation">${getMoodEmoji(entry.score)}</div>
                <h3 class="text-lg font-semibold text-pink-600 mb-2">${getMoodText(entry.score)}</h3>
                <p class="text-gray-600 text-sm mb-3">${formatDate(date)}</p>
                ${entry.text ? `<p class="text-gray-700">${entry.text}</p>` : ''}
            </div>
            <div class="flex gap-2">
                <button class="edit-btn text-blue-500 hover:text-blue-700 transition-colors" data-timestamp="${entry.timestamp}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button class="delete-btn text-pink-500 hover:text-pink-700 transition-colors" data-timestamp="${entry.timestamp}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `;

    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteMoodEntry(entry.timestamp));

    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => editMoodEntry(entry));
    
    return card;
}

function deleteMoodEntry(timestamp) {
    Swal.fire({
        title: 'Hapus Catatan?',
        text: 'Apakah kamu yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ec4899',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            // Get current entries
            let moodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
            
            // Remove the entry with matching timestamp
            moodEntries = moodEntries.filter(entry => entry.timestamp !== timestamp);
            
            // Save back to localStorage
            localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
            
            // Reload the history display
            document.getElementById('historyContainer').innerHTML = '';
            loadHistory();

            // Show success message
            Swal.fire({
                title: 'Terhapus!',
                text: 'Catatan telah berhasil dihapus.',
                icon: 'success',
                confirmButtonColor: '#ec4899'
            });
        }
    });
}

function loadHistory() {
    const historyContainer = document.getElementById('historyContainer');
    const moodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    
    if (moodEntries.length === 0) {
        historyContainer.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <p class="text-gray-500 text-lg">Belum ada catatan suasana hati.</p>
                <a href="index.html" class="inline-block mt-4 px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">
                    Tambah Catatan
                </a>
            </div>
        `;
        return;
    }
    
    moodEntries
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .forEach(entry => {
            historyContainer.appendChild(createMoodCard(entry));
        });
}

// Handle notifications
document.getElementById('notificationBtn').addEventListener('click', () => {
    const notifications = notificationService.getNotifications();
    if (notifications.length === 0) {
        Swal.fire({
            title: 'Tidak Ada Notifikasi',
            text: 'Belum ada notifikasi baru untukmu',
            icon: 'info',
            confirmButtonColor: '#ec4899'
        });
        return;
    }

    const notificationsList = notifications
        .map(n => `<div class="mb-4">
            <h3 class="font-semibold">${n.title}</h3>
            <p class="text-gray-600">${n.message}</p>
            <p class="text-sm text-gray-500">${formatDate(n.timestamp)}</p>
        </div>`)
        .join('');

    Swal.fire({
        title: 'Notifikasi',
        html: notificationsList,
        confirmButtonColor: '#ec4899'
    });
});

function editMoodEntry(entry) {
    Swal.fire({
        title: 'Edit Catatan',
        html: `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-pink-700 mb-2">Pilih suasana hati</label>
                    <select id="editMoodSelect" class="w-full p-2 border border-pink-200 rounded-md focus:ring-pink-500 focus:border-pink-500">
                        <option value="5" ${entry.score === 5 ? 'selected' : ''}>Sangat Senang 😊</option>
                        <option value="4" ${entry.score === 4 ? 'selected' : ''}>Senang 🙂</option>
                        <option value="3" ${entry.score === 3 ? 'selected' : ''}>Biasa Saja 😐</option>
                        <option value="2" ${entry.score === 2 ? 'selected' : ''}>Sedih 😔</option>
                        <option value="1" ${entry.score === 1 ? 'selected' : ''}>Sangat Sedih 😢</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-pink-700 mb-2">Deskripsi perasaan</label>
                    <textarea id="editMoodText" class="w-full p-2 border border-pink-200 rounded-md focus:ring-pink-500 focus:border-pink-500" rows="3" placeholder="Tulis deskripsi singkat tentang perasaanmu...">${entry.text || ''}</textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ec4899',
        cancelButtonColor: '#6b7280',
        preConfirm: () => {
            return {
                score: parseInt(document.getElementById('editMoodSelect').value),
                text: document.getElementById('editMoodText').value.trim()
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Get current entries
            let moodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
            
            // Find and update the entry
            const index = moodEntries.findIndex(e => e.timestamp === entry.timestamp);
            if (index !== -1) {
                moodEntries[index] = {
                    ...moodEntries[index],
                    score: result.value.score,
                    text: result.value.text
                };
                
                // Save back to localStorage
                localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
                
                // Reload the history display
                document.getElementById('historyContainer').innerHTML = '';
                loadHistory();

                // Show success message
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Catatan telah berhasil diperbarui.',
                    icon: 'success',
                    confirmButtonColor: '#ec4899'
                });
            }
        }
    });
}

// Fungsi untuk menampilkan panduan
function showGuide() {
    Swal.fire({
        title: 'Panduan Riwayat MoodSync',
        html: `
            <div class="text-left">
                <h3 class="font-semibold text-pink-600 mb-2">📖 Cara Menggunakan Halaman Riwayat:</h3>
                <ol class="space-y-2 list-decimal list-inside">
                    <li>Lihat catatan mood Anda yang tersimpan</li>
                    <li>Gunakan tombol edit untuk mengubah catatan</li>
                    <li>Gunakan tombol hapus untuk menghapus catatan</li>
                    <li>Mood ditampilkan dari yang terbaru ke yang lama</li>
                </ol>
                
                <h3 class="font-semibold text-pink-600 mt-4 mb-2">🔍 Fitur Halaman Riwayat:</h3>
                <ul class="space-y-2 list-disc list-inside">
                    <li>Melihat semua catatan mood</li>
                    <li>Mengedit catatan yang ada</li>
                    <li>Menghapus catatan</li>
                    <li>Melihat tanggal dan waktu pencatatan</li>
                </ul>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Mengerti',
        confirmButtonColor: '#ec4899',
        width: '600px',
        showClass: {
            popup: 'animate__animated animate__fadeIn'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOut'
        }
    });
}

// Event listener untuk tombol panduan
document.addEventListener('DOMContentLoaded', () => {
    const guideBtn = document.getElementById('guideBtn');
    if (guideBtn) {
        guideBtn.addEventListener('click', showGuide);
    }
});

// Load history when page loads
loadHistory();
