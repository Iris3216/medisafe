const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Routes
const { authenticateToken } = require('./middleware/authMiddleware');
const { auditLog } = require('./middleware/auditMiddleware');

app.use('/api/users',         authenticateToken, auditLog, require('./routes/users'));
app.use('/api/health-records',authenticateToken, auditLog, require('./routes/healthRecords'));
app.use('/api/medications',   authenticateToken, auditLog, require('./routes/medications'));
app.use('/api/documents',     authenticateToken, auditLog, require('./routes/documents'));

// Health Check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MediSafe Backend running on port ${PORT}`);
});

module.exports = app;