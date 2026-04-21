const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.* FROM medications m JOIN users u ON m.user_id = u.id
       WHERE u.cognito_sub = $1 ORDER BY m.created_at DESC`,
      [req.user.sub]
    );
    res.json({ data: result.rows });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const create = async (req, res) => {
  try {
    const { medication_name, dosage, frequency, start_date, end_date, prescribing_doctor } = req.body;
    if (!medication_name) return res.status(400).json({ error: 'medication_name is required' });
    const userResult = await pool.query('SELECT id FROM users WHERE cognito_sub = $1', [req.user.sub]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const result = await pool.query(
      `INSERT INTO medications (user_id, medication_name, dosage, frequency, start_date, end_date, prescribing_doctor)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userResult.rows[0].id, medication_name, dosage, frequency, start_date, end_date, prescribing_doctor]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const update = async (req, res) => {
  try {
    const { medication_name, dosage, frequency, start_date, end_date, prescribing_doctor, is_active } = req.body;
    const result = await pool.query(
      `UPDATE medications SET medication_name=$1, dosage=$2, frequency=$3,
       start_date=$4, end_date=$5, prescribing_doctor=$6, is_active=$7
       WHERE id=$8 AND user_id=(SELECT id FROM users WHERE cognito_sub=$9) RETURNING *`,
      [medication_name, dosage, frequency, start_date, end_date, prescribing_doctor, is_active, req.params.id, req.user.sub]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const remove = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM medications WHERE id=$1 AND user_id=(SELECT id FROM users WHERE cognito_sub=$2)`,
      [req.params.id, req.user.sub]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

module.exports = { getAll, create, update, remove };