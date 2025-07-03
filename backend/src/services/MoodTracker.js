const MoodEntry = require('../models/MoodEntry');

class MoodTrackerService {
    async addMoodEntry(userId, score, text) {
        try {
            const entry = new MoodEntry({
                userId,
                score,
                text,
                timestamp: new Date()
            });
            await entry.save();
            return entry;
        } catch (error) {
            throw new Error('Error adding mood entry: ' + error.message);
        }
    }

    async getMoodHistory(userId, days = 7) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            return await MoodEntry.find({
                userId,
                timestamp: { $gte: cutoffDate }
            }).sort({ timestamp: 1 });
        } catch (error) {
            throw new Error('Error getting mood history: ' + error.message);
        }
    }

    async getAverageMood(userId, days = 7) {
        try {
            const entries = await this.getMoodHistory(userId, days);
            if (entries.length === 0) return 0;
            
            const sum = entries.reduce((acc, entry) => acc + entry.score, 0);
            return sum / entries.length;
        } catch (error) {
            throw new Error('Error calculating average mood: ' + error.message);
        }
    }
}

module.exports = new MoodTrackerService();
