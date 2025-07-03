export class SessionManager {
    constructor() {
        this.storage = localStorage;
    }

    saveMoodEntry(entry) {
        const entries = this.getMoodEntries();
        entries.push(entry.toJSON());
        this.storage.setItem('moodEntries', JSON.stringify(entries));
    }

    getMoodEntries() {
        const entries = this.storage.getItem('moodEntries');
        return entries ? JSON.parse(entries) : [];
    }

    clearMoodEntries() {
        this.storage.removeItem('moodEntries');
    }
}
