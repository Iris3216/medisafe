const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const getUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, documentType } = req.body;
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(fileType)) return res.status(400).json({ error: 'File type not allowed' });
    const fileKey = `${req.user.sub}/${uuidv4()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileKey,
      ContentType: fileType,
      ServerSideEncryption: 'aws:kms',
      Metadata: { 'uploaded-by': req.user.sub, 'document-type': documentType }
    });
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    res.json({ uploadUrl: presignedUrl, fileKey, expiresIn: 300 });
  } catch (err) { res.status(500).json({ error: 'Failed to generate upload URL' }); }
};

const getDownloadUrl = async (req, res) => {
  try {
    const docResult = await pool.query(
      `SELECT md.s3_key FROM medical_documents md JOIN users u ON md.user_id = u.id
       WHERE md.id = $1 AND u.cognito_sub = $2`,
      [req.params.id, req.user.sub]
    );
    if (docResult.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    const command = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: docResult.rows[0].s3_key });
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    res.json({ downloadUrl, expiresIn: 900 });
  } catch (err) { res.status(500).json({ error: 'Failed to generate download URL' }); }
};

const saveDocument = async (req, res) => {
  try {
    const { documentName, documentType, s3Key, fileSize } = req.body;
    const userResult = await pool.query('SELECT id FROM users WHERE cognito_sub = $1', [req.user.sub]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const result = await pool.query(
      `INSERT INTO medical_documents (user_id, document_name, document_type, s3_key, file_size)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userResult.rows[0].id, documentName, documentType, s3Key, fileSize]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: 'Failed to save document' }); }
};

const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT md.* FROM medical_documents md JOIN users u ON md.user_id = u.id
       WHERE u.cognito_sub = $1 ORDER BY md.uploaded_at DESC`,
      [req.user.sub]
    );
    res.json({ data: result.rows });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

const remove = async (req, res) => {
  try {
    const docResult = await pool.query(
      `SELECT md.s3_key FROM medical_documents md JOIN users u ON md.user_id = u.id
       WHERE md.id = $1 AND u.cognito_sub = $2`,
      [req.params.id, req.user.sub]
    );
    if (docResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    await s3Client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: docResult.rows[0].s3_key }));
    await pool.query('DELETE FROM medical_documents WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: 'Internal server error' }); }
};

module.exports = { getUploadUrl, getDownloadUrl, saveDocument, getAll, remove };