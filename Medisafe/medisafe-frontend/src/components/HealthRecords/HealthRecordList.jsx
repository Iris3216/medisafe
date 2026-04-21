import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { healthRecordsAPI } from '../../services/api';

const recordTypes = [
  { value: '', label: 'ทุกประเภท' },
  { value: 'blood_pressure', label: 'ความดันโลหิต' },
  { value: 'blood_sugar', label: 'น้ำตาลในเลือด' },
  { value: 'weight', label: 'น้ำหนัก' },
  { value: 'temperature', label: 'อุณหภูมิร่างกาย' },
];

const typeLabel = {
  blood_pressure: 'ความดันโลหิต',
  blood_sugar: 'น้ำตาลในเลือด',
  weight: 'น้ำหนัก',
  temperature: 'อุณหภูมิร่างกาย',
};

const typeBadge = {
  blood_pressure: 'badge-red',
  blood_sugar: 'badge-amber',
  weight: 'badge-blue',
  temperature: 'badge-green',
};

export default function HealthRecordList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = filter ? { type: filter } : {};
      const res = await healthRecordsAPI.getAll(params);
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบบันทึกนี้หรือไม่?')) return;
    setDeleting(id);
    try {
      await healthRecordsAPI.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">บันทึกสุขภาพ</div>
        <Link to="/health-records/new" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: '14px' }}>
          + เพิ่มบันทึก
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', flexShrink: 0 }}>กรองตามประเภท:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {recordTypes.map(t => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '20px',
                  border: '0.5px solid',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderColor: filter === t.value ? 'var(--blue)' : 'var(--border)',
                  background: filter === t.value ? 'var(--blue)' : 'var(--white)',
                  color: filter === t.value ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>กำลังโหลด...</p></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <p>ยังไม่มีบันทึกสุขภาพ</p>
            <Link to="/health-records/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              + เพิ่มบันทึกแรก
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ประเภท</th>
                <th>ค่าที่วัด</th>
                <th>หน่วย</th>
                <th>วันที่วัด</th>
                <th>หมายเหตุ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>
                    <span className={`badge ${typeBadge[r.record_type] || 'badge-gray'}`}>
                      {typeLabel[r.record_type] || r.record_type}
                    </span>
                  </td>
                  <td style={{ fontWeight: '500', fontSize: '16px' }}>{r.value_numeric}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.unit}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {new Date(r.measured_at).toLocaleDateString('th-TH', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.notes || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/health-records/edit/${r.id}`}
                        style={{ fontSize: '13px', color: 'var(--blue)', textDecoration: 'none' }}
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                        style={{ fontSize: '13px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {deleting === r.id ? '...' : 'ลบ'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
