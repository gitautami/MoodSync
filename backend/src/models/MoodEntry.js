const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    text: {
        type: String,
        trim: true
    },
    analyzedEmotion: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Method untuk mendapatkan emoji berdasarkan score
moodEntrySchema.methods.getEmoji = function() {
    const emojis = ['😢', '😔', '😐', '🙂', '😊'];
    return emojis[this.score - 1];
};

const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);
module.exports = MoodEntry;
