import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { healthRecordsAPI } from '../../services/api';

const HEALTH_CONFIGS = {
  blood_pressure: {
    label: 'ความดันโลหิต',
    unit: 'mmHg',
    color: '#dc2626',
    normalRange: { min: 60, max: 120 },
  },
  blood_sugar: {
    label: 'น้ำตาลในเลือด',
    unit: 'mg/dL',
    color: '#d97706',
    normalRange: { min: 70, max: 100 },
  },
  weight: {
    label: 'น้ำหนัก',
    unit: 'kg',
    color: '#1565C0',
    normalRange: null,
  },
  temperature: {
    label: 'อุณหภูมิร่างกาย',
    unit: '°C',
    color: '#059669',
    normalRange: { min: 36.1, max: 37.2 },
  },
};

const dayOptions = [
  { value: 7, label: '7 วัน' },
  { value: 30, label: '30 วัน' },
  { value: 90, label: '3 เดือน' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', border: '0.5px solid #e2e8f0',
        borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
        fontFamily: 'Sarabun, sans-serif',
      }}>
        <div style={{ color: '#64748b', marginBottom: '6px' }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: '500' }}>
            {p.name}: {Number(p.value).toFixed(1)} {p.unit}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function HealthChart() {
  const [selectedType, setSelectedType] = useState('blood_pressure');
  const [days, setDays] = useState(30);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ avg: null, min: null, max: null });

  const config = HEALTH_CONFIGS[selectedType];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await healthRecordsAPI.getChartData(selectedType, days);
        const data = res.data?.map(d => ({
          ...d,
          date: new Date(d.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
          avg_value: parseFloat(d.avg_value),
          min_value: parseFloat(d.min_value),
          max_value: parseFloat(d.max_value),
        })) || [];
        setChartData(data);

        if (data.length > 0) {
          const avgs = data.map(d => d.avg_value);
          setStats({
            avg: (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1),
            min: Math.min(...data.map(d => d.min_value)).toFixed(1),
            max: Math.max(...data.map(d => d.max_value)).toFixed(1),
          });
        } else {
          setStats({ avg: null, min: null, max: null });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedType, days]);

  return (
    <>
      <div className="section-header">
        <div className="section-title">กราฟสุขภาพ</div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: '280px', padding: '14px 18px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>ประเภทข้อมูล</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(HEALTH_CONFIGS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: '0.5px solid',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif',
                  borderColor: selectedType === key ? cfg.color : 'var(--border)',
                  background: selectedType === key ? cfg.color : 'var(--white)',
                  color: selectedType === key ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>ช่วงเวลา</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {dayOptions.map(d => (
              <button
                key={d.value}
                onClick={() => setDays(d.value)}
                style={{
                  padding: '6px 16px', borderRadius: '20px', border: '0.5px solid',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif',
                  borderColor: days === d.value ? 'var(--blue)' : 'var(--border)',
                  background: days === d.value ? 'var(--blue)' : 'var(--white)',
                  color: days === d.value ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {stats.avg && (
        <div className="vitals-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '20px' }}>
          <div className="vital-card blue">
            <div className="vital-label">ค่าเฉลี่ย</div>
            <div className="vital-value">{stats.avg}<span className="vital-unit">{config.unit}</span></div>
          </div>
          <div className="vital-card green">
            <div className="vital-label">ค่าต่ำสุด</div>
            <div className="vital-value">{stats.min}<span className="vital-unit">{config.unit}</span></div>
          </div>
          <div className="vital-card red">
            <div className="vital-label">ค่าสูงสุด</div>
            <div className="vital-value">{stats.max}<span className="vital-unit">{config.unit}</span></div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--navy)' }}>
              {config.label}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              ย้อนหลัง {days} วัน · หน่วย: {config.unit}
            </div>
          </div>
          {config.normalRange && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '2px', background: '#059669', borderStyle: 'dashed' }} />
                ค่าปกติ: {config.normalRange.min}–{config.normalRange.max} {config.unit}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="empty-state"><p>กำลังโหลดข้อมูล...</p></div>
        ) : chartData.length === 0 ? (
          <div className="empty-state">
            <p>ยังไม่มีข้อมูล{config.label}ในช่วง {days} วันที่ผ่านมา</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fontFamily: 'Sarabun', fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: 'Sarabun', fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '13px', fontFamily: 'Sarabun' }}
              />
              {config.normalRange && (
                <>
                  <ReferenceLine
                    y={config.normalRange.max}
                    stroke="#059669"
                    strokeDasharray="6 3"
                    strokeWidth={1}
                    label={{ value: 'สูงสุดปกติ', position: 'right', fontSize: 11, fill: '#059669' }}
                  />
                  <ReferenceLine
                    y={config.normalRange.min}
                    stroke="#059669"
                    strokeDasharray="6 3"
                    strokeWidth={1}
                    label={{ value: 'ต่ำสุดปกติ', position: 'right', fontSize: 11, fill: '#059669' }}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey="avg_value"
                stroke={config.color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: config.color, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="ค่าเฉลี่ย"
                unit={config.unit}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
