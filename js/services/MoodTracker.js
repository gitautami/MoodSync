import { MoodEntry } from '../models/MoodEntry.js';
import LocalStorageService from './LocalStorageService.js';

export class MoodTracker {
    constructor() {
        this.storage = new LocalStorageService('moodEntries');
    }

    addMoodEntry(score, text) {
        const entry = new MoodEntry(score, text);
        return this.storage.save(entry);
    }

    getMoodHistory(days = 7) {
        return this.storage.getAll()
            .filter(entry => {
                const entryDate = new Date(entry.timestamp);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                return entryDate >= cutoffDate;
            })
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    getAverageMood(days = 7) {
        const entries = this.getMoodHistory(days);
        if (entries.length === 0) return 0;
        
        const sum = entries.reduce((acc, entry) => acc + entry.score, 0);
        return sum / entries.length;
    }

    deleteMoodEntry(id) {
        return this.storage.delete(id);
    }

    updateMoodEntry(id, updatedData) {
        return this.storage.update(id, updatedData);
    }

    getMoodEntryById(id) {
        return this.storage.getById(id);
    }
}
