export class ReportGenerator {
    generateWeeklyReport(moodEntries) {
        if (moodEntries.length === 0) {
            return 'No mood data available for the week.';
        }

        const averageMood = this.calculateAverageMood(moodEntries);
        const moodTrend = this.analyzeMoodTrend(moodEntries);
        const topEmotions = this.getTopEmotions(moodEntries);

        return `
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-2">Weekly Summary</h3>
                    <p>Average Mood: ${this.moodScoreToEmoji(averageMood)} (${averageMood.toFixed(1)})</p>
                    <p>Trend: ${moodTrend}</p>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-2">Most Common Emotions</h3>
                    <ul class="list-disc list-inside">
                        ${topEmotions.map(emotion => `<li>${emotion}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    calculateAverageMood(entries) {
        const sum = entries.reduce((acc, entry) => acc + entry.score, 0);
        return sum / entries.length;
    }

    analyzeMoodTrend(entries) {
        if (entries.length < 2) return 'Not enough data';
        
        const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
        const secondHalf = entries.slice(Math.floor(entries.length / 2));
        
        const firstAvg = this.calculateAverageMood(firstHalf);
        const secondAvg = this.calculateAverageMood(secondHalf);
        
        const diff = secondAvg - firstAvg;
        if (diff > 0.5) return '📈 Improving';
        if (diff < -0.5) return '📉 Declining';
        return '➡️ Stable';
    }

    getTopEmotions(entries) {
        const emotions = entries
            .filter(entry => entry.analyzedEmotion)
            .map(entry => entry.analyzedEmotion);
        
        const counts = {};
        emotions.forEach(emotion => {
            counts[emotion] = (counts[emotion] || 0) + 1;
        });

        return Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([emotion]) => emotion);
    }

    moodScoreToEmoji(score) {
        const emojis = ['😢', '😔', '😐', '🙂', '😊'];
        const index = Math.min(Math.floor(score) - 1, 4);
        return emojis[index];
    }
}
