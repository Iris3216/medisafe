import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsAPI } from '../../services/api';

const docTypes = [
  { value: 'lab_result', label: 'ผลแล็บ', icon: '🔬' },
  { value: 'prescription', label: 'ใบสั่งยา', icon: '📝' },
  { value: 'xray', label: 'ภาพเอกซเรย์', icon: '🫁' },
  { value: 'other', label: 'อื่นๆ', icon: '📄' },
];

export default function DocumentUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('lab_result');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  const validateAndSet = (f) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(f.type)) {
      setError('รองรับเฉพาะไฟล์ PDF, JPG, PNG เท่านั้น');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    setError('');
    try {
      const { uploadUrl, fileKey } = await documentsAPI.getUploadUrl({
        fileName: file.name,
        fileType: file.type,
        documentType: docType,
      });
      setProgress(40);

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      setProgress(80);

      await documentsAPI.saveDocument({
        documentName: file.name,
        documentType: docType,
        s3Key: fileKey,
        fileSize: file.size,
      });
      setProgress(100);
      setSuccess(true);
      setTimeout(() => navigate('/documents'), 1500);
    } catch (err) {
      setError('อัปโหลดไม่สำเร็จ: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const fileIcon = file?.type === 'application/pdf' ? '📕' : '🖼';

  return (
    <>
      <div className="section-header">
        <div className="section-title">อัปโหลดเอกสารทางการแพทย์</div>
      </div>

      <div className="card" style={{ maxWidth: '560px' }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">อัปโหลดสำเร็จ! กำลังนำคุณกลับ...</div>}

        <div className="form-group">
          <label className="form-label">ประเภทเอกสาร</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
            {docTypes.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setDocType(t.value)}
                style={{
                  padding: '10px 8px', borderRadius: '8px', border: '0.5px solid',
                  fontSize: '13px', cursor: 'pointer', textAlign: 'center',
                  fontFamily: 'Sarabun, sans-serif',
                  borderColor: docType === t.value ? 'var(--blue)' : 'var(--border)',
                  background: docType === t.value ? 'var(--blue-light)' : 'var(--white)',
                  color: docType === t.value ? 'var(--blue)' : 'var(--text-secondary)',
                  fontWeight: docType === t.value ? '500' : '400',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{t.icon}</div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">ไฟล์เอกสาร</label>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('file-input').click()}
            style={{
              border: `2px dashed ${file ? 'var(--blue)' : 'var(--border)'}`,
              borderRadius: '10px',
              padding: '32px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: file ? 'var(--blue-light)' : 'var(--bg)',
              transition: 'all 0.15s',
            }}
          >
            {file ? (
              <>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{fileIcon}</div>
                <div style={{ fontWeight: '500', color: 'var(--navy)', fontSize: '15px' }}>{file.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                <div style={{ fontWeight: '500', color: 'var(--navy)', fontSize: '15px' }}>คลิกหรือลากไฟล์มาวาง</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  รองรับ PDF, JPG, PNG ขนาดไม่เกิน 10MB
                </div>
              </>
            )}
          </div>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={e => e.target.files[0] && validateAndSet(e.target.files[0])}
          />
        </div>

        {uploading && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>กำลังอัปโหลด...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--blue)', borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate('/documents')}>
            ยกเลิก
          </button>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!file || uploading || success}
            style={{ minWidth: '120px' }}
          >
            {uploading ? 'กำลังอัปโหลด...' : success ? 'สำเร็จ ✓' : '⬆ อัปโหลด'}
          </button>
        </div>
      </div>
    </>
  );
}
