const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    // Reuse existing connection pool for serverless execution
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = 'mongodb://127.0.0.1:27017/eduvera_db';

    if (primaryUri) {
        try {
            const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
            console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
            return conn;
        } catch (err) {
            console.warn(`⚠️ Primary MongoDB connection timed out (${err.message}). Trying fallback...`);
            try { await mongoose.disconnect(); } catch (_) {}
        }
    }

    try {
        const conn = await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 2000 });
        console.log(`✅ MongoDB Connected successfully (Local): ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error(`👉 Tip: Set a valid MONGODB_URI in Vercel Environment Variables or start local mongod.`);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
