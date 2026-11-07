const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

// Import Modular Routes
const authRoutes = require('./routes/authRoutes');
const statsRoutes = require('./routes/statsRoutes');
const studentRoutes = require('./routes/studentRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Connect to MongoDB Database
connectDB();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Mount API Route Modules
app.use('/api', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', studentRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

const fs = require('fs');

// Health Check Endpoint for Cloud Monitoring & Uptime
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'EduVera National Education & Migration API',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend in production if built together
const staticPath = path.join(__dirname, '../Client/dist');
const indexPath = path.join(staticPath, 'index.html');
if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
}

// Catch-all route to serve index.html or API Welcome
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API route not found' });
    } else if (req.path.startsWith('/assets')) {
        res.status(404).send('Asset not found');
    } else if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.json({
            service: 'EduVera Sovereign Student Education & Migration Registry API',
            status: 'Online',
            endpoints: {
                health: '/health',
                schools: '/api/schools',
                stats: '/api/stats/overview'
            },
            message: 'Backend server is running on Vercel. Connect your frontend client via VITE_API_BASE_URL.'
        });
    }
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 EduVera Server running in MVC mode on port ${PORT}`);
    });
}

module.exports = app;
