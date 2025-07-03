const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MoodTrackerService = require('../services/MoodTracker');
const NotificationService = require('../services/NotificationService');
const ReportGenerator = require('../services/ReportGenerator');

// Mood Entry Routes
router.post('/mood', auth, async (req, res) => {
    try {
        const { score, text } = req.body;
        const entry = await MoodTrackerService.addMoodEntry(req.user.id, score, text);
        
        // Check for negative patterns and notify if needed
        const history = await MoodTrackerService.getMoodHistory(req.user.id);
        await NotificationService.checkAndNotify(req.user.id, history);
        
        res.status(201).json(entry);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/mood/history', auth, async (req, res) => {
    try {
        const days = req.query.days || 7;
        const history = await MoodTrackerService.getMoodHistory(req.user.id, days);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Report Routes
router.get('/report/weekly', auth, async (req, res) => {
    try {
        const history = await MoodTrackerService.getMoodHistory(req.user.id, 7);
        const report = ReportGenerator.generateWeeklyReport(history);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Notification Routes
router.get('/notifications', auth, async (req, res) => {
    try {
        const notifications = NotificationService.getNotifications();
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/notifications/:id/read', auth, async (req, res) => {
    try {
        const success = NotificationService.markAsRead(req.params.id);
        if (success) {
            res.json({ message: 'Notification marked as read' });
        } else {
            res.status(404).json({ error: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
