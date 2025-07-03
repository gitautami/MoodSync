export class EmotionAnalyzer {
    constructor() {
        this.positiveWords = new Set(['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good', 'love', 'peaceful']);
        this.negativeWords = new Set(['sad', 'angry', 'upset', 'terrible', 'horrible', 'bad', 'hate', 'stressed', 'anxious']);
    }

    analyzeSentiment(text) {
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        
        words.forEach(word => {
            if (this.positiveWords.has(word)) score += 1;
            if (this.negativeWords.has(word)) score -= 1;
        });

        return {
            score: Math.max(1, Math.min(5, Math.round(3 + score * 0.5))), // Convert to 1-5 scale
            sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
        };
    }
}
