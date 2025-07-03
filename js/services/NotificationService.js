export class NotificationService {
    constructor() {
        this.notifications = [];
        this.hasPermission = false;
        this.init();
    }

    async init() {
        if ("Notification" in window) {
            const permission = await Notification.requestPermission();
            this.hasPermission = permission === "granted";
        }
    }

    checkMoodPattern(moodEntries) {
        if (moodEntries.length < 3) return;

        const recentEntries = moodEntries.slice(-3);
        const isNegativePattern = recentEntries.every(entry => entry.score <= 2);

        if (isNegativePattern) {
            this.notify(
                "Peringatan Suasana Hati", 
                "Kami melihat kamu sedang merasa kurang baik akhir-akhir ini. Cobalah untuk berbicara dengan seseorang atau lakukan aktivitas yang dapat menghibur."
            );
        }
    }

    notifyMoodInput(score, text) {
        let title, message;

        if (score <= 2) { // Sedih atau Sangat Sedih
            title = "Tetap Semangat! 💪";
            if (score === 1) {
                message = "Hari yang berat ya? Ingat, setiap badai pasti berlalu. Cobalah melakukan hal-hal yang membuatmu senang seperti mendengarkan musik favorit atau menghubungi teman dekat. Kamu tidak sendiri! 🌈";
            } else {
                message = "Sedih itu normal, tapi jangan biarkan perasaan ini berlangsung lama. Bagaimana kalau kita coba aktivitas menyenangkan? Mungkin jalan-jalan singkat atau menulis diary bisa membantu. 🌟";
            }
        } else if (score >= 4) { // Senang atau Sangat Senang
            title = "Hari yang Indah! ✨";
            if (score === 5) {
                message = "Wah, kamu sedang sangat bahagia! Bagus sekali! Jangan lupa berbagi kebahagiaan dengan orang di sekitarmu. Semoga hari-harimu selalu secerah ini! 🌞";
            } else {
                message = "Senang melihatmu dalam suasana hati yang baik! Teruskan hal-hal positif yang kamu lakukan hari ini. Semoga keceriaanmu menular ke sekitar! 😊";
            }
        } else { // Biasa saja
            title = "Refleksi Harian 🤔";
            message = "Hari yang normal ya? Ini waktu yang tepat untuk membuat hari jadi lebih berwarna. Mungkin ada hal menyenangkan yang bisa kamu rencanakan? 🎯";
        }

        this.notify(title, message);
    }

    notify(title, message) {
        if (this.hasPermission) {
            new Notification(title, { body: message });
        }
        
        this.notifications.push({
            title,
            message,
            timestamp: new Date()
        });
    }

    getNotifications() {
        return this.notifications;
    }
}
