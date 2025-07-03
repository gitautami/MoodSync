require('dotenv').config();
const connectDB = require('../src/config/db');

const testConnection = async () => {
    try {
        await connectDB();
        console.log('Database connection test successful!');
        process.exit(0);
    } catch (error) {
        console.error('Database connection test failed:', error);
        process.exit(1);
    }
};

testConnection();
