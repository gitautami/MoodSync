// Import required modules
import { SessionManager } from './models/SessionManager.js';
import { MoodTracker } from './models/MoodTracker.js';
import { NotificationService } from './models/NotificationService.js';
import { ReportGenerator } from './models/ReportGenerator.js';
// Tidak ada import deteksi wajah

class App {
    constructor() {
        console.log('[App] Inisialisasi aplikasi...');
        this.sessionManager = new SessionManager();
        this.moodTracker = new MoodTracker(this.sessionManager);
        // this.emotionAnalyzer = new EmotionAnalyzer(); // Tidak digunakan, hapus jika tidak dipakai
        this.notificationService = new NotificationService();
        this.reportGenerator = new ReportGenerator();

        this.moodChart = null;

        try {
            this.initializeUI();
        } catch (err) {
            console.error('[App] Error saat initializeUI:', err);
        }
        try {
            this.setupEventListeners();
        } catch (err) {
            console.error('[App] Error saat setupEventListeners:', err);
        }
        try {
            this.updateUI();
        } catch (err) {
            console.error('[App] Error saat updateUI:', err);
        }
    }

    getMoodEmoji(score) {
        const emojis = {
            5: '😊',
            4: '🙂',
            3: '😐',
            2: '😔',
            1: '😢'
        };
        return emojis[score] || '😐';
    }

    getMoodText(score) {
        const moods = {
            5: 'Sangat Senang',
            4: 'Senang',
            3: 'Biasa Saja',
            2: 'Sedih',
            1: 'Sangat Sedih'
        };
        return moods[score] || 'Biasa Saja';
    }



    initializeUI() {
        const chartCanvas = document.getElementById('moodChart');
        if (!chartCanvas) {
            console.warn('[App] moodChart canvas tidak ditemukan di DOM.');
            return;
        }
        try {
            this.moodChart = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Suasana Hati',
                        data: [],
                        borderColor: '#ec4899',
                        backgroundColor: 'rgba(236, 72, 153, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ec4899',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#ec4899',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
                            grid: {
                                color: 'rgba(236, 72, 153, 0.1)',
                                borderColor: 'rgba(236, 72, 153, 0.2)'
                            },
                            ticks: {
                                stepSize: 1,
                                color: '#ec4899',
                                font: {
                                    family: 'Inter',
                                    size: 12
                                },
                                callback: function(value) {
                                    const labels = {
                                        1: '😢 Sangat Sedih',
                                        2: '😔 Sedih',
                                        3: '😐 Biasa',
                                        4: '🙂 Senang',
                                        5: '😊 Sangat Senang'
                                    };
                                    return labels[value] || '';
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(236, 72, 153, 0.1)',
                                borderColor: 'rgba(236, 72, 153, 0.2)'
                            },
                            ticks: {
                                color: '#ec4899',
                                font: {
                                    family: 'Inter',
                                    size: 12
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(236, 72, 153, 0.9)',
                            titleFont: {
                                family: 'Inter',
                                size: 14
                            },
                            bodyFont: {
                                family: 'Inter',
                                size: 13
                            },
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed.y;
                                    const labels = {
                                        1: '😢 Sangat Sedih',
                                        2: '😔 Sedih',
                                        3: '😐 Biasa',
                                        4: '🙂 Senang',
                                        5: '😊 Sangat Senang'
                                    };
                                    return labels[value] || '';
                                    }
                                }
                            }
                        }
                    }
                });
        } catch (err) {
            console.error('[App] Gagal membuat Chart:', err);
            // Jika gagal, biarkan canvas tetap kosong
        }
    }

    setupEventListeners() {
        const submitButton = document.getElementById('submitMood');
        const notificationButton = document.getElementById('notificationBtn');
        const moodSelect = document.getElementById('moodSelect');
        const moodText = document.getElementById('moodText');

        if (submitButton) {
            submitButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleMoodSubmission();
            });
        }

        if (notificationButton) {
            notificationButton.addEventListener('click', () => this.showNotifications());
        }

        // Handle enter key in textarea
        if (moodText) {
            moodText.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    await this.handleMoodSubmission();
                }
            });
        }

        // Handle enter key in select
        if (moodSelect) {
            moodSelect.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    await this.handleMoodSubmission();
                }
            });
        }

        // Menambahkan event listener untuk tombol panduan
        const guideBtn = document.getElementById('guideBtn');
        if (guideBtn) {
            guideBtn.addEventListener('click', () => this.showGuide());
        }
    }

    showGuide() {
        Swal.fire({
            title: 'Panduan Penggunaan MoodSync',
            html: `
                <div class="text-left">
                    <h3 class="font-semibold text-pink-600 mb-2">🎯 Cara Menggunakan MoodSync:</h3>
                    <ol class="space-y-2 list-decimal list-inside">
                        <li>Pilih tingkat suasana hati Anda dari skala 1-5</li>
                        <li>Tambahkan catatan detail tentang perasaan Anda (opsional)</li>
                        <li>Klik tombol "Simpan Suasana Hati" untuk menyimpan</li>
                        <li>Lihat grafik perubahan mood Anda di bagian Linimasa</li>
                        <li>Cek refleksi mingguan untuk insight mendalam</li>
                    </ol>
                    
                    <h3 class="font-semibold text-pink-600 mt-4 mb-2">📊 Fitur Utama:</h3>
                    <ul class="space-y-2 list-disc list-inside">
                        <li>Pencatatan mood harian</li>
                        <li>Visualisasi grafik mood</li>
                        <li>Riwayat mood lengkap</li>
                        <li>Analisis dan refleksi mingguan</li>
                        <li>Notifikasi pengingat</li>
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

    showNotifications() {
        const notifications = this.notificationService.getNotifications();
        if (!notifications || notifications.length === 0) {
            Swal.fire({
                title: 'Tidak Ada Notifikasi',
                text: 'Belum ada notifikasi baru untukmu',
                icon: 'info',
                confirmButtonColor: '#ec4899'
            });
            return;
        }

        const notificationsList = notifications
            .map(notification => {
                if (!notification) return '';
                const { title, message, timestamp } = notification;
                return `<div class="mb-4">
                    <h3 class="font-semibold">${title || ''}</h3>
                    <p class="text-gray-600">${message || ''}</p>
                    <p class="text-sm text-gray-500">${new Date(timestamp).toLocaleString('id-ID')}</p>
                </div>`;
            })
            .filter(item => item)
            .join('');

        Swal.fire({
            title: 'Notifikasi',
            html: notificationsList || '<p>Tidak ada notifikasi</p>',
            confirmButtonColor: '#ec4899'
        });
    }

    async handleMoodSubmission() {
        console.log('[App] Handling mood submission');
        try {
            const moodSelect = document.getElementById('moodSelect');
            const moodTextArea = document.getElementById('moodText');

            if (!moodSelect || !moodTextArea) {
                throw new Error('Required form elements not found');
            }

            const moodScore = parseInt(moodSelect.value, 10);
            const moodText = moodTextArea.value.trim();

            if (isNaN(moodScore) || moodScore < 1 || moodScore > 5) {
                throw new Error('Invalid mood score');
            }

            console.log(`[App] About to save mood: score=${moodScore}, text=${moodText}`);
            
            // Simpan mood entry
            const entry = this.moodTracker.addMoodEntry(moodScore, moodText);
            console.log('[App] Mood entry saved result:', entry);
            
            if (!entry) {
                throw new Error('Failed to save mood entry');
            }

            // Reset form
            moodTextArea.value = '';
            moodSelect.value = '3'; // Reset ke 'Biasa Saja'

            // Update UI
            await this.updateUI();

            // Show success message
            const emoji = this.getMoodEmoji(moodScore);
            await Swal.fire({
                title: `Tersimpan! ${emoji}`,
                text: 'Catatan suasana hatimu telah disimpan',
                icon: 'success',
                confirmButtonColor: '#ec4899',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });

            return entry;
        } catch (error) {
            console.error('[App] Error submitting mood:', error);
            await Swal.fire({
                title: 'Error',
                text: error.message || 'Gagal menyimpan catatan suasana hati',
                icon: 'error',
                confirmButtonColor: '#ec4899'
            });
            // Don't throw the error to prevent UI from breaking
            return null;
        }
    }

    async updateUI() {
        try {
            // Get all mood entries
            const moodHistory = this.moodTracker.getAllMoodEntries();
            
            // Sort entries by timestamp (if any)
            const sortedEntries = Array.isArray(moodHistory) && moodHistory.length > 0 
                ? moodHistory.sort((a, b) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                  )
                : [];
            
            // Always update chart, even with empty data
            this.updateChart(sortedEntries);

            // Update weekly report
            this.updateWeeklyReport();
        } catch (error) {
            console.error('Error updating UI:', error);
            // Don't throw the error, just log it to prevent UI from breaking
            this.updateChart([]);
            this.updateWeeklyReport();
        }
    }

    updateChart(moodHistory = []) {
        console.log('[App] Updating chart with', moodHistory.length, 'entries');
        
        if (!this.moodChart) {
            console.warn('[App] Chart not initialized, reinitializing...');
            this.initializeUI();
            if (!this.moodChart) {
                console.error('[App] Failed to initialize chart');
                return;
            }
        }
        
        try {
            // Format tanggal untuk label
            const formatDate = (timestamp) => {
                const date = new Date(timestamp);
                return date.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };
            
            // Ensure we have valid data
            if (Array.isArray(moodHistory) && moodHistory.length > 0) {
                console.log('[App] Updating chart with data:', moodHistory);
                
                // Update data grafik
                const labels = moodHistory.map(entry => formatDate(entry.timestamp));
                const data = moodHistory.map(entry => entry.score);
                
                console.log('[App] Chart labels:', labels);
                console.log('[App] Chart data:', data);
                
                this.moodChart.data.labels = labels;
                this.moodChart.data.datasets[0].data = data;
                
                // Tambahkan tooltip custom untuk menampilkan teks mood
                this.moodChart.options.plugins.tooltip.callbacks.afterLabel = (context) => {
                    const entry = moodHistory[context.dataIndex];
                    if (entry && entry.text) {
                        return `Catatan: ${entry.text}`;
                    }
                    return '';
                };
            } else {
                console.log('[App] No data for chart, resetting');
                // Reset chart if no entries
                this.moodChart.data.labels = [];
                this.moodChart.data.datasets[0].data = [];
                if (this.moodChart.options.plugins.tooltip && 
                    this.moodChart.options.plugins.tooltip.callbacks) {
                    this.moodChart.options.plugins.tooltip.callbacks.afterLabel = () => '';
                }
            }
            
            // Always update the chart even if there's no data
            console.log('[App] Updating chart display');
            this.moodChart.update();
        } catch (error) {
            console.error('[App] Error updating chart:', error);
            if (this.moodChart) {
                this.moodChart.data.labels = [];
                this.moodChart.data.datasets[0].data = [];
                this.moodChart.update();
            }
        }
    }

    updateWeeklyReport() {
        const weeklyReport = document.getElementById('weeklyReport');
        if (!weeklyReport) return;

        const moodEntries = this.moodTracker.getWeeklyMoodEntries();
        if (!moodEntries || moodEntries.length === 0) {
            weeklyReport.innerHTML = `
                <div class="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-pink-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="text-lg text-gray-600">Belum ada data untuk minggu ini.</p>
                    <p class="text-sm text-gray-500 mt-2">Mulai catat suasana hatimu untuk melihat refleksi mingguan!</p>
                </div>`;
            return;
        }

        const report = this.reportGenerator.generateWeeklyReport(moodEntries);
        const averageMood = report.averageMood;
        const moodEmoji = this.getMoodEmoji(Math.round(averageMood));
        
        weeklyReport.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                    <div>
                        <h3 class="text-lg font-semibold text-pink-600">Rata-rata Suasana Hati</h3>
                        <p class="text-3xl font-bold text-pink-500 mt-1">${moodEmoji} ${averageMood.toFixed(1)}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-600">Total Catatan</p>
                        <p class="text-2xl font-semibold text-pink-500">${moodEntries.length}</p>
                    </div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <h3 class="text-lg font-semibold text-pink-600 mb-3">Ringkasan Minggu Ini</h3>
                    <p class="text-gray-700 leading-relaxed">${report.summary}</p>
                </div>

                ${report.details ? `
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <h3 class="text-lg font-semibold text-pink-600 mb-3">Detail Analisis</h3>
                    <p class="text-gray-700 leading-relaxed">${report.details}</p>
                </div>` : ''}

                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <h3 class="text-lg font-semibold text-pink-600 mb-3">Rekomendasi</h3>
                    <ul class="list-disc list-inside space-y-2 text-gray-700">
                        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>`;
    }

}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.notificationService.init();
});

// Export the App class
export { App };
