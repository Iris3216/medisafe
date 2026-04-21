const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { type, from, to, limit = 50 } = req.query;
    let query = `SELECT hr.* FROM health_records hr JOIN users u ON hr.user_id = u.id WHERE u.cognito_sub = $1`;
    const params = [userId];
    let p = 1;
    if (type) { p++; query += ` AND hr.record_type = $${p}`; params.push(type); }
    if (from) { p++; query += ` AND hr.measured_at >= $${p}`; params.push(from); }
    if (to)   { p++; query += ` AND hr.measured_at <= $${p}`; params.push(to); }
    query += ` ORDER BY hr.measured_at DESC LIMIT $${p+1}`;
    params.push(parseInt(limit));
    const result = await pool.query(query, params);
    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const getById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT hr.* FROM health_records hr JOIN users u ON hr.user_id = u.id WHERE hr.id = $1 AND u.cognito_sub = $2`,
      [req.params.id, req.user.sub]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const create = async (req, res) => {
  try {
    const { record_type, value_numeric, value_text, unit, measured_at, notes } = req.body;
    if (!record_type || !measured_at) return res.status(400).json({ error: 'record_type and measured_at are required' });
    const userResult = await pool.query('SELECT id FROM users WHERE cognito_sub = $1', [req.user.sub]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const result = await pool.query(
      `INSERT INTO health_records (user_id, record_type, value_numeric, value_text, unit, measured_at, notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userResult.rows[0].id, record_type, value_numeric, value_text, unit, measured_at, notes]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const update = async (req, res) => {
  try {
    const { record_type, value_numeric, value_text, unit, measured_at, notes } = req.body;
    const result = await pool.query(
      `UPDATE health_records SET record_type=$1, value_numeric=$2, value_text=$3, unit=$4, measured_at=$5, notes=$6 WHERE id=$7 AND user_id=(SELECT id FROM users WHERE cognito_sub=$8) RETURNING *`,
      [record_type, value_numeric, value_text, unit, measured_at, notes, req.params.id, req.user.sub]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const remove = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM health_records WHERE id=$1 AND user_id=(SELECT id FROM users WHERE cognito_sub=$2)`,
      [req.params.id, req.user.sub]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const getChartData = async (req, res) => {
  try {
    const { type, days = 30 } = req.query;
    const result = await pool.query(
      `SELECT DATE(measured_at) as date, AVG(value_numeric) as avg_value, MIN(value_numeric) as min_value, MAX(value_numeric) as max_value FROM health_records hr JOIN users u ON hr.user_id = u.id WHERE u.cognito_sub = $1 AND hr.record_type = $2 AND hr.measured_at >= NOW() - INTERVAL '${parseInt(days)} days' GROUP BY DATE(measured_at) ORDER BY date ASC`,
      [req.user.sub, type]
    );
    res.json({ data: result.rows });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

module.exports = { getAll, getById, create, update, remove, getChartData };