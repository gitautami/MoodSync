/**
 * SessionManager class for managing user sessions
 */
export class SessionManager {
    constructor() {
        this.storageKey = 'userSession';
        console.log('[SessionManager] Initialized');
    }

    /**
     * Initialize the session manager
     */
    init() {
        console.log('[SessionManager] Initializing session');
        // Check if there's an existing session
        const session = this.getSession();
        if (!session) {
            // Create a new session if none exists
            this.createSession();
        }
        return true;
    }

    /**
     * Create a new user session
     */
    createSession() {
        console.log('[SessionManager] Creating new session');
        const session = {
            id: this.generateSessionId(),
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(session));
            return session;
        } catch (error) {
            console.error('[SessionManager] Error creating session:', error);
            return null;
        }
    }

    /**
     * Get the current session
     */
    getSession() {
        try {
            const sessionData = localStorage.getItem(this.storageKey);
            if (!sessionData) return null;
            
            const session = JSON.parse(sessionData);
            // Update last active time
            session.lastActive = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(session));
            
            return session;
        } catch (error) {
            console.error('[SessionManager] Error getting session:', error);
            return null;
        }
    }

    /**
     * Clear the current session
     */
    clearSession() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('[SessionManager] Error clearing session:', error);
            return false;
        }
    }

    /**
     * Generate a unique session ID
     */
    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
