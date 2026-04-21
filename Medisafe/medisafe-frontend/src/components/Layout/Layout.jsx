import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';

const navItems = [
  { section: 'OVERVIEW', items: [
    { path: '/dashboard', icon: '⊞', label: 'แดชบอร์ด' },
  ]},
  { section: 'ข้อมูลสุขภาพ', items: [
    { path: '/health-records', icon: '♥', label: 'บันทึกสุขภาพ' },
    { path: '/health-chart', icon: '📈', label: 'กราฟสุขภาพ' },
    { path: '/medications', icon: '💊', label: 'รายการยา' },
  ]},
  { section: 'เอกสาร', items: [
    { path: '/documents', icon: '📋', label: 'เอกสารทางการแพทย์' },
    { path: '/documents/upload', icon: '⬆', label: 'อัปโหลดเอกสาร' },
  ]},
  { section: 'บัญชี', items: [
    { path: '/profile', icon: '👤', label: 'โปรไฟล์' },
  ]},
];

export default function Layout({ children, user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    await Auth.signOut();
    window.location.href = '/login';
  } catch (err) {
    console.error(err);
    window.location.href = '/login';
  }
};

  const userName = user?.attributes?.email?.split('@')[0] || 'ผู้ใช้';
  const initial = userName.charAt(0).toUpperCase();

  const today = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="8" y="2" width="4" height="16" rx="2" fill="white"/>
              <rect x="2" y="8" width="16" height="4" rx="2" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-text">MediSafe</div>
            <div className="sidebar-logo-sub">HEALTH MANAGEMENT</div>
          </div>
        </div>

        {navItems.map((group) => (
          <div key={group.section}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}

        <div className="sidebar-footer">
  <div
    onClick={handleLogout}
    className="nav-item"
    style={{ color: 'rgba(255,100,100,0.75)', cursor: 'pointer' }}
  >
    <span className="nav-item-icon">⏻</span>
    ออกจากระบบ
  </div>
</div>
      </div>

      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-greeting">สวัสดี, {userName}</div>
            <div className="topbar-date">{today} · ภาพรวมสุขภาพประจำวัน</div>
          </div>
          <div className="topbar-right">
            <div className="status-badge">● ระบบปกติ</div>
            <div className="avatar">{initial}</div>
          </div>
        </div>

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
