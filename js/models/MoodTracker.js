import { MoodEntry } from './MoodEntry.js';

export class MoodTracker {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
        this.storageKey = 'moodEntries';
        console.log('[MoodTracker] Initialized');
        
        // Check if localStorage is available
        this.storageAvailable = this.checkStorageAvailable();
        if (!this.storageAvailable) {
            console.error('[MoodTracker] localStorage is not available');
        }
    }
    
    checkStorageAvailable() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.error('[MoodTracker] localStorage test failed:', e);
            return false;
        }
    }

    addMoodEntry(score, text = '') {
        console.log(`[MoodTracker] Adding mood entry: score=${score}, text=${text}`);
        try {
            const entry = new MoodEntry(score, text);
            console.log('[MoodTracker] Created new entry:', entry);
            
            const entries = this.getAllMoodEntries();
            entries.push(entry);
            
            const saved = this.saveMoodEntries(entries);
            if (saved) {
                console.log('[MoodTracker] Successfully saved mood entry');
                return entry;
            } else {
                console.error('[MoodTracker] Failed to save mood entry');
                return null;
            }
        } catch (error) {
            console.error('[MoodTracker] Error in addMoodEntry:', error);
            return null;
        }
    }

    getAllMoodEntries() {
        console.log('[MoodTracker] Getting all mood entries');
        if (!this.storageAvailable) {
            console.error('[MoodTracker] Cannot get entries: localStorage not available');
            return [];
        }
        
        try {
            const entriesJson = localStorage.getItem(this.storageKey);
            console.log('[MoodTracker] Raw entries from localStorage:', entriesJson);
            
            if (!entriesJson) {
                console.log('[MoodTracker] No entries found in localStorage');
                return [];
            }
            
            const entries = JSON.parse(entriesJson);
            
            if (!Array.isArray(entries)) {
                console.error('[MoodTracker] Stored mood entries is not an array');
                return [];
            }
            
            const parsedEntries = entries.map(e => MoodEntry.fromJSON(e));
            console.log(`[MoodTracker] Retrieved ${parsedEntries.length} entries`);
            return parsedEntries;
        } catch (e) {
            console.error('[MoodTracker] Error parsing mood entries:', e);
            return [];
        }
    }

    getWeeklyMoodEntries() {
        const allEntries = this.getAllMoodEntries();
        if (!Array.isArray(allEntries) || allEntries.length === 0) {
            return [];
        }
        
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return allEntries.filter(entry => {
            if (!entry || !entry.timestamp) return false;
            const entryDate = entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);
            return entryDate >= weekAgo && entryDate <= now;
        });
    }

    saveMoodEntries(entries) {
        console.log(`[MoodTracker] Saving ${entries.length} mood entries`);
        
        if (!this.storageAvailable) {
            console.error('[MoodTracker] Cannot save entries: localStorage not available');
            return false;
        }
        
        try {
            if (!Array.isArray(entries)) {
                console.error('[MoodTracker] Cannot save non-array entries');
                return false;
            }
            
            const entriesData = entries.map(e => e.toJSON());
            const entriesJson = JSON.stringify(entriesData);
            
            console.log('[MoodTracker] Saving JSON data:', entriesJson);
            localStorage.setItem(this.storageKey, entriesJson);
            
            // Verify the data was saved correctly
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData === entriesJson) {
                console.log(`[MoodTracker] Successfully saved ${entries.length} mood entries to localStorage`);
                return true;
            } else {
                console.error('[MoodTracker] Verification failed: saved data does not match');
                return false;
            }
        } catch (error) {
            console.error('[MoodTracker] Error saving mood entries:', error);
            return false;
        }
    }

    deleteMoodEntry(timestamp) {
        try {
            const entries = this.getAllMoodEntries();
            const filteredEntries = entries.filter(entry => entry.timestamp.getTime() !== timestamp);
            this.saveMoodEntries(filteredEntries);
        } catch (error) {
            console.error('Error deleting mood entry:', error);
            throw error;
        }
    }

    updateMoodEntry(timestamp, updatedScore, updatedText) {
        try {
            const entries = this.getAllMoodEntries();
            const entryIndex = entries.findIndex(entry => entry.timestamp.getTime() === timestamp);
            
            if (entryIndex === -1) {
                throw new Error('Entry not found');
            }

            entries[entryIndex].score = updatedScore;
            entries[entryIndex].text = updatedText;
            
            this.saveMoodEntries(entries);
            return entries[entryIndex];
        } catch (error) {
            console.error('Error updating mood entry:', error);
            throw error;
        }
    }
}
