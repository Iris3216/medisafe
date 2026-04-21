import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    setLoading(true);
    try {
      await Auth.signUp({ username: email, password, attributes: { email } });
      setStep(2);
    } catch (err) {
      setError(err.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await Auth.confirmSignUp(email, code);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'ยืนยันอีเมลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="9" y="2" width="4" height="18" rx="2" fill="white"/>
              <rect x="2" y="9" width="18" height="4" rx="2" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: '22px', fontWeight: '600', color: '#0A2342' }}>MediSafe</span>
        </div>
        <div className="auth-subtitle">
          {step === 1 ? 'สมัครสมาชิกใหม่' : 'ยืนยันอีเมลของคุณ'}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">อีเมล</label>
              <input
                type="email"
                className="form-input"
                placeholder="กรอกอีเมลของคุณ"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">รหัสผ่าน</label>
              <input
                type="password"
                className="form-input"
                placeholder="อย่างน้อย 8 ตัว ตัวใหญ่ + ตัวเลข + อักขระพิเศษ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                className="form-input"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', borderRadius: '8px', padding: '14px', marginBottom: '20px', fontSize: '14px', color: '#1565C0' }}>
              ระบบส่ง OTP ไปที่ <strong>{email}</strong> แล้วครับ กรุณาตรวจสอบอีเมล
            </div>
            <div className="form-group">
              <label className="form-label">รหัส OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="กรอกรหัส 6 หลักจากอีเมล"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                style={{ letterSpacing: '4px', fontSize: '20px', textAlign: 'center' }}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? 'กำลังยืนยัน...' : 'ยืนยันอีเมล'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          มีบัญชีแล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  );
}
