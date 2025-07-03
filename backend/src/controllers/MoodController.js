const MoodTracker = require('../services/MoodTracker');
const NotificationService = require('../services/NotificationService');

class MoodController {
    async addMood(req, res) {
        try {
            const { score, text } = req.body;
            const userId = req.user.id; // dari middleware auth

            const moodEntry = await MoodTracker.addMoodEntry(userId, score, text);
            
            // Check for negative patterns & send notification if needed
            await NotificationService.checkAndNotify(userId, await MoodTracker.getMoodHistory(userId));

            res.status(201).json(moodEntry);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getMoodHistory(req, res) {
        try {
            const userId = req.user.id;
            const days = req.query.days || 7;

            const history = await MoodTracker.getMoodHistory(userId, days);
            res.json(history);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getWeeklyReport(req, res) {
        try {
            const userId = req.user.id;
            const moodEntries = await MoodTracker.getMoodHistory(userId, 7);
            const report = ReportGenerator.generateWeeklyReport(moodEntries);
            res.json(report);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new MoodController();
