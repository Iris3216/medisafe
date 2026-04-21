const pool = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE cognito_sub = $1',
      [req.user.sub]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const createProfile = async (req, res) => {
  try {
    const { full_name, date_of_birth, blood_type, allergies, emergency_contact } = req.body;
    if (!full_name) return res.status(400).json({ error: 'full_name is required' });

    const existing = await pool.query('SELECT id FROM users WHERE cognito_sub = $1', [req.user.sub]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Profile already exists' });

    const result = await pool.query(
      `INSERT INTO users (cognito_sub, full_name, date_of_birth, blood_type, allergies, emergency_contact)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.sub, full_name, date_of_birth, blood_type, allergies, emergency_contact]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, date_of_birth, blood_type, allergies, emergency_contact } = req.body;
    const result = await pool.query(
      `UPDATE users SET full_name=$1, date_of_birth=$2, blood_type=$3,
       allergies=$4, emergency_contact=$5, updated_at=NOW()
       WHERE cognito_sub=$6 RETURNING *`,
      [full_name, date_of_birth, blood_type, allergies, emergency_contact, req.user.sub]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

module.exports = { getProfile, createProfile, updateProfile };