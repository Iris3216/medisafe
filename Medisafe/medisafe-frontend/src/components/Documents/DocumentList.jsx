import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentsAPI } from '../../services/api';

const docTypeLabel = {
  lab_result: 'ผลแล็บ',
  prescription: 'ใบสั่งยา',
  xray: 'ภาพเอกซเรย์',
  other: 'อื่นๆ',
};

const docTypeBadge = {
  lab_result: 'badge-blue',
  prescription: 'badge-green',
  xray: 'badge-amber',
  other: 'badge-gray',
};

const docTypeIcon = {
  lab_result: '🔬',
  prescription: '📝',
  xray: '🫁',
  other: '📄',
};

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await documentsAPI.getAll();
        setDocuments(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleDownload = async (id) => {
    try {
      const res = await documentsAPI.getDownloadUrl(id);
      window.open(res.downloadUrl, '_blank');
    } catch (err) {
      alert('ดาวน์โหลดไม่สำเร็จ: ' + err.message);
    }
  };

  const filtered = filter ? documents.filter(d => d.document_type === filter) : documents;

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">เอกสารทางการแพทย์</div>
        <Link to="/documents/upload" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: '14px' }}>
          + อัปโหลดเอกสาร
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', flexShrink: 0 }}>ประเภท:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[{ value: '', label: 'ทั้งหมด' }, ...Object.entries(docTypeLabel).map(([v, l]) => ({ value: v, label: l }))].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: '5px 14px', borderRadius: '20px', border: '0.5px solid',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif',
                  borderColor: filter === f.value ? 'var(--blue)' : 'var(--border)',
                  background: filter === f.value ? 'var(--blue)' : 'var(--white)',
                  color: filter === f.value ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card"><div className="empty-state"><p>กำลังโหลด...</p></div></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>ยังไม่มีเอกสาร</p>
            <Link to="/documents/upload" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              + อัปโหลดเอกสารแรก
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filtered.map(doc => (
            <div key={doc.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: '#F8FAFF', border: '0.5px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0
                }}>
                  {docTypeIcon[doc.document_type] || '📄'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '500', fontSize: '15px', color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.document_name}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge ${docTypeBadge[doc.document_type] || 'badge-gray'}`}>
                      {docTypeLabel[doc.document_type] || doc.document_type}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                <span>{formatSize(doc.file_size)}</span>
                <span>{new Date(doc.uploaded_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>

              <button
                onClick={() => handleDownload(doc.id)}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '13px', padding: '8px' }}
              >
                ⬇ ดาวน์โหลด
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
