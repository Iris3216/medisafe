import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { healthRecordsAPI } from '../../services/api';

const recordTypes = [
  { value: 'blood_pressure', label: 'ความดันโลหิต', unit: 'mmHg', placeholder: 'เช่น 120/80' },
  { value: 'blood_sugar', label: 'น้ำตาลในเลือด', unit: 'mg/dL', placeholder: 'เช่น 95' },
  { value: 'weight', label: 'น้ำหนัก', unit: 'kg', placeholder: 'เช่น 65.5' },
  { value: 'temperature', label: 'อุณหภูมิร่างกาย', unit: '°C', placeholder: 'เช่น 37.0' },
];

export default function HealthRecordForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    record_type: 'blood_pressure',
    value_numeric: '',
    unit: 'mmHg',
    measured_at: new Date().toISOString().slice(0, 16),
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchRecord = async () => {
        try {
          const res = await healthRecordsAPI.getAll();
          const record = res.data?.find(r => r.id === id);
          if (record) {
            setForm({
              record_type: record.record_type,
              value_numeric: record.value_numeric,
              unit: record.unit,
              measured_at: new Date(record.measured_at).toISOString().slice(0, 16),
              notes: record.notes || '',
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchRecord();
    }
  }, [id, isEdit]);

  const handleTypeChange = (type) => {
    const found = recordTypes.find(t => t.value === type);
    setForm(prev => ({ ...prev, record_type: type, unit: found?.unit || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await healthRecordsAPI.update(id, form);
      } else {
        await healthRecordsAPI.create(form);
      }
      navigate('/health-records');
    } catch (err) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const currentType = recordTypes.find(t => t.value === form.record_type);

  return (
    <>
      <div className="section-header">
        <div className="section-title">{isEdit ? 'แก้ไขบันทึกสุขภาพ' : 'เพิ่มบันทึกสุขภาพ'}</div>
      </div>

      <div className="card" style={{ maxWidth: '560px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ประเภทการวัด</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
              {recordTypes.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '0.5px solid',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderColor: form.record_type === t.value ? 'var(--blue)' : 'var(--border)',
                    background: form.record_type === t.value ? 'var(--blue-light)' : 'var(--white)',
                    color: form.record_type === t.value ? 'var(--blue)' : 'var(--text-primary)',
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: form.record_type === t.value ? '500' : '400',
                  }}
                >
                  {t.label}
                  <div style={{ fontSize: '12px', color: form.record_type === t.value ? 'var(--blue)' : 'var(--text-muted)', marginTop: '2px' }}>
                    {t.unit}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">ค่าที่วัดได้</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder={currentType?.placeholder || ''}
                value={form.value_numeric}
                onChange={e => setForm(prev => ({ ...prev, value_numeric: e.target.value }))}
                required
                style={{ fontSize: '18px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">หน่วย</label>
              <input
                type="text"
                className="form-input"
                value={form.unit}
                onChange={e => setForm(prev => ({ ...prev, unit: e.target.value }))}
                style={{ width: '90px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '18px' }}>
            <label className="form-label">วันและเวลาที่วัด</label>
            <input
              type="datetime-local"
              className="form-input"
              value={form.measured_at}
              onChange={e => setForm(prev => ({ ...prev, measured_at: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">หมายเหตุ (ไม่บังคับ)</label>
            <textarea
              className="form-textarea"
              placeholder="เช่น วัดหลังตื่นนอน, หลังออกกำลังกาย..."
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/health-records')}
            >
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มบันทึก'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
