export class User {
    constructor(id, name) {
        this.id = id || crypto.randomUUID();
        this.name = name;
        this.moodLogs = [];
    }

    addMoodEntry(moodEntry) {
        this.moodLogs.push(moodEntry);
    }

    getRecentMoods(days = 7) {
        const now = new Date();
        const cutoff = new Date(now.setDate(now.getDate() - days));
        return this.moodLogs.filter(log => new Date(log.timestamp) >= cutoff);
    }
}
