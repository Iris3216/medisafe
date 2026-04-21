import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { healthRecordsAPI } from '../../services/api';
import { medicationsAPI } from '../../services/api';
import { documentsAPI } from '../../services/api';

const modules = [
  { path: '/health-records', icon: '📊', bg: '#EFF6FF', name: 'บันทึกสุขภาพ', desc: 'เพิ่ม / แก้ไขข้อมูล' },
  { path: '/health-chart', icon: '📈', bg: '#F0FDF4', name: 'กราฟสุขภาพ', desc: 'ดูแนวโน้ม 7/30/90 วัน' },
  { path: '/medications', icon: '💊', bg: '#FFFBEB', name: 'รายการยา', desc: 'ยาปัจจุบัน / หยุดใช้แล้ว' },
  { path: '/documents', icon: '📋', bg: '#FEF2F2', name: 'เอกสาร', desc: 'ผลแล็บ, ใบสั่งยา' },
  { path: '/documents/upload', icon: '⬆', bg: '#F5F3FF', name: 'อัปโหลดเอกสาร', desc: 'PDF / รูปภาพ' },
  { path: '/profile', icon: '👤', bg: '#F0FDF4', name: 'โปรไฟล์', desc: 'ข้อมูลส่วนตัว, กรุ๊ปเลือด' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ records: 0, meds: 0, docs: 0, lastBP: null });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [records, meds, docs] = await Promise.allSettled([
          healthRecordsAPI.getAll({ limit: 5 }),
          medicationsAPI.getAll(),
          documentsAPI.getAll ? documentsAPI.getAll() : Promise.resolve({ data: [] }),
        ]);

        const recordData = records.status === 'fulfilled' ? records.value : { data: [], total: 0 };
        const medData = meds.status === 'fulfilled' ? meds.value : { data: [] };
        const docData = docs.status === 'fulfilled' ? docs.value : { data: [] };

        const activeMeds = medData.data?.filter(m => m.is_active) || [];
        const lastBP = recordData.data?.find(r => r.record_type === 'blood_pressure');

        setStats({
          records: recordData.total || recordData.data?.length || 0,
          meds: activeMeds.length,
          docs: docData.data?.length || 0,
          lastBP: lastBP ? `${lastBP.value_numeric} ${lastBP.unit}` : null,
        });
        setRecentRecords(recordData.data?.slice(0, 5) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recordTypeLabel = {
    blood_pressure: 'ความดันโลหิต',
    blood_sugar: 'น้ำตาลในเลือด',
    weight: 'น้ำหนัก',
    temperature: 'อุณหภูมิร่างกาย',
  };

  return (
    <>
      <div className="vitals-grid">
        <div className="vital-card blue">
          <div className="vital-label">บันทึกสุขภาพ</div>
          <div className="vital-value">
            {loading ? '—' : stats.records}
            <span className="vital-unit">รายการ</span>
          </div>
          <div className="vital-status">ทั้งหมด</div>
        </div>
        <div className="vital-card green">
          <div className="vital-label">ยาที่ใช้อยู่</div>
          <div className="vital-value">
            {loading ? '—' : stats.meds}
            <span className="vital-unit">รายการ</span>
          </div>
          <div className={`vital-status ${stats.meds > 0 ? 'normal' : ''}`}>
            {stats.meds > 0 ? 'กำลังใช้งาน' : 'ยังไม่มีข้อมูล'}
          </div>
        </div>
        <div className="vital-card amber">
          <div className="vital-label">เอกสาร</div>
          <div className="vital-value">
            {loading ? '—' : stats.docs}
            <span className="vital-unit">ไฟล์</span>
          </div>
          <div className="vital-status">ทั้งหมด</div>
        </div>
        <div className="vital-card red">
          <div className="vital-label">ความดันล่าสุด</div>
          <div className="vital-value" style={{ fontSize: stats.lastBP ? '18px' : '24px' }}>
            {loading ? '—' : stats.lastBP || '—'}
          </div>
          <div className={`vital-status ${stats.lastBP ? 'normal' : ''}`}>
            {stats.lastBP ? 'mmHg' : 'ยังไม่มีข้อมูล'}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="section-header">
            <div className="section-title">เมนูหลัก</div>
          </div>
          <div className="module-grid">
            {modules.map((m) => (
              <Link key={m.path} to={m.path} className="module-card">
                <div className="module-icon" style={{ background: m.bg }}>{m.icon}</div>
                <div>
                  <div className="module-name">{m.name}</div>
                  <div className="module-desc">{m.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="section-header">
            <div className="section-title">บันทึกล่าสุด</div>
            <Link to="/health-records" className="view-all-btn">ดูทั้งหมด →</Link>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div className="empty-state"><p>กำลังโหลด...</p></div>
            ) : recentRecords.length === 0 ? (
              <div className="empty-state">
                <p>ยังไม่มีบันทึกสุขภาพ</p>
                <Link to="/health-records" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                  + เพิ่มบันทึกแรก
                </Link>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ประเภท</th>
                    <th>ค่า</th>
                    <th>วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((r) => (
                    <tr key={r.id}>
                      <td>{recordTypeLabel[r.record_type] || r.record_type}</td>
                      <td><strong>{r.value_numeric}</strong> {r.unit}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {new Date(r.measured_at).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
