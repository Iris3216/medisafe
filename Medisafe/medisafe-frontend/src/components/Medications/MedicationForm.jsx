import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { medicationsAPI } from '../../services/api';

const frequencies = [
  'วันละ 1 ครั้ง', 'วันละ 2 ครั้ง', 'วันละ 3 ครั้ง',
  'เช้า-เย็น', 'เช้า-กลางวัน-เย็น', 'ก่อนอาหาร', 'หลังอาหาร', 'ก่อนนอน',
];

export default function MedicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    prescribing_doctor: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetch = async () => {
        try {
          const res = await medicationsAPI.getAll();
          const med = res.data?.find(m => m.id === id);
          if (med) {
            setForm({
              medication_name: med.medication_name,
              dosage: med.dosage || '',
              frequency: med.frequency || '',
              start_date: med.start_date ? med.start_date.slice(0, 10) : '',
              end_date: med.end_date ? med.end_date.slice(0, 10) : '',
              prescribing_doctor: med.prescribing_doctor || '',
              is_active: med.is_active,
            });
          }
        } catch (err) { console.error(err); }
      };
      fetch();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await medicationsAPI.update(id, form);
      } else {
        await medicationsAPI.create(form);
      }
      navigate('/medications');
    } catch (err) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">{isEdit ? 'แก้ไขรายการยา' : 'เพิ่มรายการยา'}</div>
      </div>

      <div className="card" style={{ maxWidth: '560px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ชื่อยา <span style={{ color: 'var(--red)' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น Metformin, Amlodipine"
              value={form.medication_name}
              onChange={e => setForm(p => ({ ...p, medication_name: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">ขนาดยา</label>
              <input
                type="text"
                className="form-input"
                placeholder="เช่น 500mg, 5mg"
                value={form.dosage}
                onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">แพทย์ผู้สั่งยา</label>
              <input
                type="text"
                className="form-input"
                placeholder="ชื่อแพทย์"
                value={form.prescribing_doctor}
                onChange={e => setForm(p => ({ ...p, prescribing_doctor: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ความถี่ในการรับประทาน</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {frequencies.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, frequency: f }))}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    border: '0.5px solid',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'Sarabun, sans-serif',
                    borderColor: form.frequency === f ? 'var(--blue)' : 'var(--border)',
                    background: form.frequency === f ? 'var(--blue)' : 'var(--white)',
                    color: form.frequency === f ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="หรือพิมพ์เอง..."
              value={form.frequency}
              onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">วันเริ่มต้น</label>
              <input
                type="date"
                className="form-input"
                value={form.start_date}
                onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">วันสิ้นสุด (ถ้ามี)</label>
              <input
                type="date"
                className="form-input"
                value={form.end_date}
                onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                style={{ width: '16px', height: '16px' }}
              />
              <span className="form-label" style={{ margin: 0 }}>กำลังใช้ยานี้อยู่</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/medications')}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มรายการยา'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
