class NotificationService {
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

    checkNegativePattern(moodEntries) {
        if (moodEntries.length < 3) return false;
        
        const recentEntries = moodEntries.slice(-3);
        return recentEntries.every(entry => entry.score <= 2);
    }

    async notify(title, message) {
        // Browser notification
        if (this.hasPermission) {
            new Notification(title, { body: message });
        }

        // Store notification
        const notification = {
            id: Date.now(),
            title,
            message,
            timestamp: new Date(),
            read: false
        };
        
        this.notifications.unshift(notification);
        return notification;
    }

    async checkAndNotify(userId, moodEntries) {
        if (this.checkNegativePattern(moodEntries)) {
            await this.notify(
                "Peringatan Suasana Hati",
                "Kami melihat kamu sedang merasa kurang baik akhir-akhir ini. " +
                "Cobalah untuk berbicara dengan seseorang atau lakukan aktivitas yang menghibur."
            );
            return true;
        }
        return false;
    }

    getNotifications() {
        return this.notifications;
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            return true;
        }
        return false;
    }
}

module.exports = new NotificationService();
