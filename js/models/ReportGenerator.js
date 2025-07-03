/**
 * ReportGenerator class for generating mood reports
 */
export class ReportGenerator {
    constructor() {
        console.log('[ReportGenerator] Initialized');
    }

    /**
     * Generate a weekly report based on mood entries
     * @param {Array} moodEntries - Array of mood entries
     * @returns {Object} Report object with summary, details, and recommendations
     */
    generateWeeklyReport(moodEntries) {
        console.log(`[ReportGenerator] Generating weekly report from ${moodEntries.length} entries`);
        
        if (!moodEntries || moodEntries.length === 0) {
            return {
                averageMood: 0,
                summary: "Tidak ada data untuk minggu ini.",
                details: null,
                recommendations: ["Mulai catat suasana hatimu setiap hari untuk melihat pola emosi."]
            };
        }

        // Calculate average mood
        const totalScore = moodEntries.reduce((sum, entry) => sum + entry.score, 0);
        const averageMood = totalScore / moodEntries.length;
        
        // Count mood frequencies
        const moodCounts = {
            5: 0, // Sangat Senang
            4: 0, // Senang
            3: 0, // Biasa Saja
            2: 0, // Sedih
            1: 0  // Sangat Sedih
        };
        
        moodEntries.forEach(entry => {
            if (moodCounts[entry.score] !== undefined) {
                moodCounts[entry.score]++;
            }
        });
        
        // Find most frequent mood
        let mostFrequentMood = 3;
        let maxCount = 0;
        
        for (const [mood, count] of Object.entries(moodCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostFrequentMood = parseInt(mood);
            }
        }
        
        // Generate summary
        let summary = this.generateSummary(averageMood, mostFrequentMood, moodEntries.length);
        
        // Generate details if we have enough entries
        let details = null;
        if (moodEntries.length >= 3) {
            details = this.generateDetails(moodEntries, moodCounts);
        }
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(averageMood, moodEntries);
        
        return {
            averageMood,
            summary,
            details,
            recommendations
        };
    }
    
    /**
     * Generate summary text based on mood data
     */
    generateSummary(averageMood, mostFrequentMood, entryCount) {
        let summary = "";
        
        // Describe average mood
        if (averageMood >= 4.5) {
            summary = "Minggu ini kamu merasa sangat bahagia! ";
        } else if (averageMood >= 3.5) {
            summary = "Minggu ini suasana hatimu cenderung positif. ";
        } else if (averageMood >= 2.5) {
            summary = "Minggu ini suasana hatimu cukup netral. ";
        } else if (averageMood >= 1.5) {
            summary = "Minggu ini kamu cenderung merasa sedih. ";
        } else {
            summary = "Minggu ini kamu mengalami perasaan yang sangat sedih. ";
        }
        
        // Add frequency information
        summary += `Kamu telah mencatat ${entryCount} entri suasana hati. `;
        
        // Add most frequent mood
        const moodTexts = {
            5: "sangat senang",
            4: "senang",
            3: "biasa saja",
            2: "sedih",
            1: "sangat sedih"
        };
        
        summary += `Suasana hati yang paling sering kamu alami adalah ${moodTexts[mostFrequentMood]}.`;
        
        return summary;
    }
    
    /**
     * Generate detailed analysis
     */
    generateDetails(moodEntries, moodCounts) {
        // Check for mood patterns
        let details = "";
        
        // Check for mood swings
        const scores = moodEntries.map(entry => entry.score);
        let swings = 0;
        
        for (let i = 1; i < scores.length; i++) {
            if (Math.abs(scores[i] - scores[i-1]) >= 2) {
                swings++;
            }
        }
        
        if (swings > 0 && moodEntries.length >= 4) {
            const swingPercentage = (swings / (moodEntries.length - 1)) * 100;
            if (swingPercentage > 30) {
                details += "Terlihat adanya perubahan suasana hati yang cukup signifikan dalam minggu ini. ";
            }
        }
        
        // Check for consistent patterns
        if (moodCounts[5] + moodCounts[4] > moodEntries.length * 0.7) {
            details += "Kamu konsisten merasa positif sepanjang minggu. Pertahankan! ";
        } else if (moodCounts[1] + moodCounts[2] > moodEntries.length * 0.7) {
            details += "Kamu konsisten merasa kurang baik sepanjang minggu. ";
        } else if (moodCounts[3] > moodEntries.length * 0.6) {
            details += "Suasana hatimu cenderung netral sepanjang minggu. ";
        }
        
        // Add time-based patterns if we have enough entries
        if (moodEntries.length >= 5) {
            const morningMoods = [];
            const afternoonMoods = [];
            const eveningMoods = [];
            
            moodEntries.forEach(entry => {
                const hour = new Date(entry.timestamp).getHours();
                if (hour >= 5 && hour < 12) {
                    morningMoods.push(entry.score);
                } else if (hour >= 12 && hour < 18) {
                    afternoonMoods.push(entry.score);
                } else {
                    eveningMoods.push(entry.score);
                }
            });
            
            const calcAverage = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
            
            const morningAvg = calcAverage(morningMoods);
            const afternoonAvg = calcAverage(afternoonMoods);
            const eveningAvg = calcAverage(eveningMoods);
            
            if (morningMoods.length && afternoonMoods.length && eveningMoods.length) {
                let bestTime = "pagi";
                let bestAvg = morningAvg;
                
                if (afternoonAvg > bestAvg) {
                    bestTime = "siang";
                    bestAvg = afternoonAvg;
                }
                
                if (eveningAvg > bestAvg) {
                    bestTime = "malam";
                    bestAvg = eveningAvg;
                }
                
                details += `Kamu cenderung merasa lebih baik di waktu ${bestTime} hari. `;
            }
        }
        
        return details || "Belum cukup data untuk analisis detail.";
    }
    
    /**
     * Generate recommendations based on mood data
     */
    generateRecommendations(averageMood, moodEntries) {
        const recommendations = [];
        
        // Basic recommendation for all
        recommendations.push("Catat suasana hatimu secara teratur untuk mendapatkan wawasan yang lebih baik.");
        
        // Recommendations based on average mood
        if (averageMood <= 2.5) {
            recommendations.push("Cobalah aktivitas yang meningkatkan suasana hati seperti olahraga, meditasi, atau berbicara dengan teman.");
            recommendations.push("Pertimbangkan untuk berbicara dengan profesional jika perasaan sedih berlangsung lama.");
        } else if (averageMood >= 4) {
            recommendations.push("Bagikan energi positifmu dengan orang lain di sekitarmu.");
            recommendations.push("Refleksikan apa yang membuatmu bahagia dan lakukan lebih sering.");
        } else {
            recommendations.push("Coba identifikasi hal-hal yang meningkatkan suasana hatimu dan lakukan lebih sering.");
        }
        
        // Recommendation based on entry count
        if (moodEntries.length < 5) {
            recommendations.push("Catat suasana hatimu lebih sering untuk mendapatkan analisis yang lebih akurat.");
        }
        
        return recommendations;
    }
}
