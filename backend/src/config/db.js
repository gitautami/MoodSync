const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moodsync', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Membuat indexes untuk performa
        await Promise.all([
            conn.model('User').createIndexes(),
            conn.model('MoodEntry').createIndexes()
        ]);
        
        console.log('Database indexes ensured');
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
