import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { usersAPI } from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', blood_type: '',
    allergies: '', emergency_contact: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const u = await Auth.currentAuthenticatedUser();
        setUser(u);
        const res = await usersAPI.getProfile();
        if (res.data) {
          setForm({
            full_name: res.data.full_name || '',
            date_of_birth: res.data.date_of_birth ? res.data.date_of_birth.slice(0,10) : '',
            blood_type: res.data.blood_type || '',
            allergies: res.data.allergies || '',
            emergency_contact: res.data.emergency_contact || '',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await usersAPI.updateProfile(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const email = user?.attributes?.email || '';
  const initial = email.charAt(0).toUpperCase();

  return (
    <>
      <div className="section-header">
        <div className="section-title">โปรไฟล์ของฉัน</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '600', margin: '0 auto 16px' }}>
            {initial}
          </div>
          <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--navy)' }}>{form.full_name || 'ผู้ใช้'}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{email}</div>
          {form.blood_type && (
            <div style={{ marginTop: '12px' }}>
              <span className="badge badge-red" style={{ fontSize: '14px', padding: '4px 12px' }}>หมู่เลือด {form.blood_type}</span>
            </div>
          )}
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', fontSize: '13px' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Cognito ID</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', wordBreak: 'break-all' }}>{user?.attributes?.sub?.slice(0, 16)}...</div>
          </div>
        </div>
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">บันทึกข้อมูลสำเร็จ ✓</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ borderBottom: '0.5px solid var(--border)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)' }}>ข้อมูลส่วนตัว</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">ชื่อ-นามสกุล</label>
                <input type="text" className="form-input" placeholder="ชื่อ-นามสกุล" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">วันเกิด</label>
                <input type="date" className="form-input" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">หมู่เลือด</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {bloodTypes.map(bt => (
                  <button key={bt} type="button" onClick={() => setForm(p => ({ ...p, blood_type: bt }))}
                    style={{ width: '52px', height: '40px', borderRadius: '8px', border: '0.5px solid', fontSize: '14px', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif', fontWeight: '500', borderColor: form.blood_type === bt ? 'var(--red)' : 'var(--border)', background: form.blood_type === bt ? '#FEF2F2' : 'var(--white)', color: form.blood_type === bt ? 'var(--red)' : 'var(--text-secondary)' }}>
                    {bt}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ borderBottom: '0.5px solid var(--border)', paddingBottom: '14px', marginBottom: '18px', marginTop: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)' }}>ข้อมูลทางการแพทย์</div>
            </div>
            <div className="form-group">
              <label className="form-label">ประวัติการแพ้ยา / สารก่อภูมิแพ้</label>
              <textarea className="form-textarea" placeholder="เช่น แพ้ Penicillin, แพ้กุ้ง..." value={form.allergies} onChange={e => setForm(p => ({ ...p, allergies: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">ผู้ติดต่อฉุกเฉิน</label>
              <input type="text" className="form-input" placeholder="ชื่อ - เบอร์โทร เช่น คุณแม่ - 081-xxx-xxxx" value={form.emergency_contact} onChange={e => setForm(p => ({ ...p, emergency_contact: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: '140px' }}>
                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}