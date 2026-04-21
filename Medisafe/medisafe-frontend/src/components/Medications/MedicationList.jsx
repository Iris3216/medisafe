import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { medicationsAPI } from '../../services/api';

export default function MedicationList() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  const fetchMeds = async () => {
    setLoading(true);
    try {
      const res = await medicationsAPI.getAll();
      setMedications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeds(); }, []);

  const handleToggle = async (med) => {
    try {
      await medicationsAPI.update(med.id, { ...med, is_active: !med.is_active });
      setMedications(prev => prev.map(m => m.id === med.id ? { ...m, is_active: !m.is_active } : m));
    } catch (err) {
      alert('อัปเดตไม่สำเร็จ: ' + err.message);
    }
  };

  const filtered = medications.filter(m =>
    filter === 'active' ? m.is_active : !m.is_active
  );

  return (
    <>
      <div className="section-header">
        <div className="section-title">รายการยา</div>
        <Link to="/medications/new" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: '14px' }}>
          + เพิ่มรายการยา
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[{ value: 'active', label: 'ยาที่ใช้อยู่' }, { value: 'inactive', label: 'หยุดใช้แล้ว' }].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '7px 20px',
              borderRadius: '20px',
              border: '0.5px solid',
              fontSize: '14px',
              cursor: 'pointer',
              borderColor: filter === f.value ? 'var(--blue)' : 'var(--border)',
              background: filter === f.value ? 'var(--blue)' : 'var(--white)',
              color: filter === f.value ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'Sarabun, sans-serif',
            }}
          >
            {f.label}
            <span style={{
              marginLeft: '6px',
              background: filter === f.value ? 'rgba(255,255,255,0.25)' : 'var(--bg)',
              padding: '1px 7px',
              borderRadius: '10px',
              fontSize: '12px',
            }}>
              {medications.filter(m => f.value === 'active' ? m.is_active : !m.is_active).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card"><div className="empty-state"><p>กำลังโหลด...</p></div></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>{filter === 'active' ? 'ยังไม่มียาที่ใช้อยู่' : 'ยังไม่มียาที่หยุดใช้แล้ว'}</p>
            <Link to="/medications/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              + เพิ่มรายการยา
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {filtered.map(med => (
            <div key={med.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    💊
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--navy)' }}>{med.medication_name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{med.dosage}</div>
                  </div>
                </div>
                <span className={`badge ${med.is_active ? 'badge-green' : 'badge-gray'}`}>
                  {med.is_active ? 'กำลังใช้' : 'หยุดใช้'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '8px 12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ความถี่</div>
                  <div style={{ fontSize: '14px', color: 'var(--navy)', marginTop: '2px' }}>{med.frequency || '—'}</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '8px 12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>แพทย์ผู้สั่งยา</div>
                  <div style={{ fontSize: '14px', color: 'var(--navy)', marginTop: '2px' }}>{med.prescribing_doctor || '—'}</div>
                </div>
                {med.start_date && (
                  <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '8px 12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>วันเริ่มต้น</div>
                    <div style={{ fontSize: '14px', color: 'var(--navy)', marginTop: '2px' }}>
                      {new Date(med.start_date).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                )}
                {med.end_date && (
                  <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '8px 12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>วันสิ้นสุด</div>
                    <div style={{ fontSize: '14px', color: 'var(--navy)', marginTop: '2px' }}>
                      {new Date(med.end_date).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to={`/medications/edit/${med.id}`}
                  style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px', border: '0.5px solid var(--border)', fontSize: '13px', color: 'var(--blue)', textDecoration: 'none' }}
                >
                  แก้ไข
                </Link>
                <button
                  onClick={() => handleToggle(med)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: '0.5px solid',
                    fontSize: '13px', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif',
                    borderColor: med.is_active ? 'var(--border)' : 'var(--blue)',
                    background: med.is_active ? 'var(--white)' : 'var(--blue-light)',
                    color: med.is_active ? 'var(--text-secondary)' : 'var(--blue)',
                  }}
                >
                  {med.is_active ? 'หยุดใช้ยา' : 'กลับมาใช้ยา'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
