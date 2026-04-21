const pool = require('../config/database');

const auditLog = async (req, res, next) => {
  const start = Date.now();

  res.on('finish', async () => {
    const logEntry = {
      userId: req.user?.sub || 'anonymous',
      action: `${req.method} ${req.path}`,
      resource: req.path.split('/')[2] || 'unknown',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: Date.now() - start,
    };

    console.log(JSON.stringify(logEntry));

    try {
      await pool.query(
        `INSERT INTO audit_logs (action, resource, ip_address, user_agent)
         VALUES ($1, $2, $3::inet, $4)`,
        [
          `[${res.statusCode}] ${logEntry.action}`,
          logEntry.resource,
          logEntry.ip || '0.0.0.0',
          logEntry.userAgent,
        ]
      );
    } catch (err) {
      console.error('Audit log error:', err.message);
    }
  });

  next();
};

module.exports = { auditLog };