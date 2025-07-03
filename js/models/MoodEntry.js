export class MoodEntry {
    constructor(score, text, timestamp = null) {
        this.id = this.generateUUID();
        this.score = score;
        this.text = text;
        this.timestamp = timestamp ? new Date(timestamp) : new Date();
        this.analyzedEmotion = null;
    }
    
    // Generate a UUID (compatible with all browsers)
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    setAnalyzedEmotion(emotion) {
        this.analyzedEmotion = emotion;
    }

    toJSON() {
        return {
            id: this.id,
            score: this.score,
            text: this.text,
            timestamp: this.timestamp.toISOString(),
            analyzedEmotion: this.analyzedEmotion
        };
    }

    static fromJSON(obj) {
        const entry = new MoodEntry(obj.score, obj.text, obj.timestamp);
        entry.id = obj.id;
        entry.analyzedEmotion = obj.analyzedEmotion;
        return entry;
    }
}
