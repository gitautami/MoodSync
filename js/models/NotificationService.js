/**
 * NotificationService class for managing user notifications
 */
export class NotificationService {
    constructor() {
        this.storageKey = 'userNotifications';
        this.notifications = [];
        console.log('[NotificationService] Initialized');
    }

    /**
     * Initialize the notification service
     */
    async init() {
        console.log('[NotificationService] Initializing');
        try {
            // Load existing notifications
            this.loadNotifications();
            
            // Check for permission to show browser notifications
            if ("Notification" in window) {
                if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                    console.log('[NotificationService] Requesting notification permission');
                    await Notification.requestPermission();
                }
            }
            
            return true;
        } catch (error) {
            console.error('[NotificationService] Error initializing:', error);
            return false;
        }
    }

    /**
     * Load notifications from storage
     */
    loadNotifications() {
        try {
            const storedNotifications = localStorage.getItem(this.storageKey);
            if (storedNotifications) {
                this.notifications = JSON.parse(storedNotifications);
                console.log(`[NotificationService] Loaded ${this.notifications.length} notifications`);
            } else {
                this.notifications = [];
            }
            return this.notifications;
        } catch (error) {
            console.error('[NotificationService] Error loading notifications:', error);
            this.notifications = [];
            return [];
        }
    }

    /**
     * Save notifications to storage
     */
    saveNotifications() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
            return true;
        } catch (error) {
            console.error('[NotificationService] Error saving notifications:', error);
            return false;
        }
    }

    /**
     * Add a new notification
     */
    addNotification(title, message) {
        const notification = {
            id: this.generateId(),
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        this.notifications.unshift(notification);
        this.saveNotifications();
        
        // Show browser notification if permission granted
        this.showBrowserNotification(title, message);
        
        return notification;
    }

    /**
     * Show a browser notification
     */
    showBrowserNotification(title, message) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }

    /**
     * Get all notifications
     */
    getNotifications() {
        return this.notifications;
    }

    /**
     * Mark a notification as read
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            return true;
        }
        return false;
    }

    /**
     * Clear all notifications
     */
    clearNotifications() {
        this.notifications = [];
        this.saveNotifications();
        return true;
    }

    /**
     * Generate a unique ID for notifications
     */
    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}
