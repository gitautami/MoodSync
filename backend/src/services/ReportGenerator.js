class ReportGenerator {
    generateWeeklyReport(moodEntries) {
        if (moodEntries.length === 0) {
            return {
                summary: "Belum ada data untuk minggu ini.",
                averageMood: 0,
                recommendations: ["Mulai catat suasana hatimu setiap hari."]
            };
        }

        const averageMood = this.calculateAverageMood(moodEntries);
        const moodTrend = this.analyzeMoodTrend(moodEntries);
        const topEmotions = this.getTopEmotions(moodEntries);

        return {
            summary: this.generateSummary(averageMood, moodTrend),
            averageMood,
            moodTrend,
            topEmotions,
            recommendations: this.generateRecommendations(averageMood, moodEntries)
        };
    }

    calculateAverageMood(entries) {
        const sum = entries.reduce((acc, entry) => acc + entry.score, 0);
        return sum / entries.length;
    }

    analyzeMoodTrend(entries) {
        if (entries.length < 2) return 'Belum cukup data';
        
        const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
        const secondHalf = entries.slice(Math.floor(entries.length / 2));
        
        const firstAvg = this.calculateAverageMood(firstHalf);
        const secondAvg = this.calculateAverageMood(secondHalf);
        
        const diff = secondAvg - firstAvg;
        if (diff > 0.5) return '📈 Membaik';
        if (diff < -0.5) return '📉 Menurun';
        return '➡️ Stabil';
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

    generateSummary(averageMood, trend) {
        let summary = '';
        
        if (averageMood >= 4) {
            summary = 'Minggu ini kamu memiliki suasana hati yang sangat baik! ';
        } else if (averageMood >= 3) {
            summary = 'Minggu ini suasana hatimu cukup baik. ';
        } else {
            summary = 'Minggu ini kamu mengalami beberapa tantangan emosional. ';
        }

        summary += `Tren menunjukkan suasana hatimu ${trend.toLowerCase()}. `;
        return summary;
    }

    generateRecommendations(averageMood, entries) {
        const recommendations = [];

        if (averageMood <= 2.5) {
            recommendations.push(
                "Cobalah aktivitas yang menenangkan seperti meditasi atau olahraga ringan.",
                "Berbicara dengan teman atau keluarga bisa membantu memperbaiki suasana hati."
            );
        } else if (averageMood >= 4) {
            recommendations.push(
                "Pertahankan aktivitas positif yang kamu lakukan!",
                "Bagikan energi positifmu dengan orang lain."
            );
        } else {
            recommendations.push(
                "Identifikasi hal-hal yang membuat suasana hatimu lebih baik.",
                "Tetap jaga keseimbangan aktivitas dan istirahat."
            );
        }

        return recommendations;
    }
}

module.exports = new ReportGenerator();
