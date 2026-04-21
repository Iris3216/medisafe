# MediSafe — ระบบจัดการข้อมูลสุขภาพส่วนตัว

ระบบเว็บแอปพลิเคชันสำหรับจัดการข้อมูลสุขภาพส่วนตัว พัฒนาด้วย React + Node.js บน AWS Cloud

## 🌐 Demo

```
http://54.254.227.127
```

---

## 🏗️ Architecture

```
[React Frontend] → [Nginx] → [Node.js/Express API] → [RDS PostgreSQL]
                                      ↕
                              [AWS Cognito Auth]
                                      ↕
                              [S3 + KMS Files]
                                      ↕
                              [CloudWatch Logs]
```

---

## 📦 Tech Stack

### Frontend
- React 18 + React Router
- AWS Amplify (Cognito Auth)
- Recharts (Health Charts)
- Font: Sarabun (Google Fonts)

### Backend
- Node.js + Express
- PostgreSQL (AWS RDS)
- AWS SDK v3 (S3, KMS)
- PM2 (Process Manager)
- Nginx (Reverse Proxy)

### AWS Services
| Service | การใช้งาน |
|---------|-----------|
| Cognito | Authentication / JWT |
| RDS PostgreSQL | ฐานข้อมูลหลัก |
| S3 + KMS | เก็บไฟล์เอกสาร + เข้ารหัส |
| EC2 + Nginx | Deploy Backend + Frontend |
| CloudWatch | Monitoring + Alerts |
| SNS | Email Notifications |
| IAM | Security & Access Control |

---

## 🚀 การติดตั้งและ Deploy

### Prerequisites
- Node.js 18+
- AWS CLI configured
- AWS Account

### 1. Clone Project
```bash
git clone <repository>
cd Medisafe
```

### 2. ติดตั้ง Frontend
```bash
cd medisafe-frontend
npm install --legacy-peer-deps
```

สร้างไฟล์ `.env`:
```env
REACT_APP_COGNITO_USER_POOL_ID=ap-southeast-1_XXXXXXXXX
REACT_APP_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_S3_BUCKET=medisafe-files-bucket
REACT_APP_API_URL=http://your-server-ip
```

### 3. ติดตั้ง Backend
```bash
cd medisafe-backend
npm install
```

สร้างไฟล์ `.env`:
```env
PORT=3001
NODE_ENV=production
AWS_REGION=ap-southeast-1
RDS_HOSTNAME=your-rds-endpoint.rds.amazonaws.com
RDS_PORT=5432
RDS_DB_NAME=medisafe
RDS_USERNAME=medisafe_admin
RDS_PASSWORD=YourPassword
COGNITO_USER_POOL_ID=ap-southeast-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
S3_BUCKET=medisafe-files-bucket
FRONTEND_URL=http://your-server-ip
```

### 4. รัน Database Schema
```bash
psql "host=your-rds-endpoint user=medisafe_admin dbname=medisafe sslmode=require" < schema.sql
```

### 5. Build Frontend
```bash
cd medisafe-frontend
npm run build
```

### 6. Deploy บน EC2
```bash
# Backend
pm2 start src/app.js --name medisafe-api
pm2 save

# Frontend
sudo cp -r build/* /var/www/medisafe/
sudo systemctl restart nginx
```

---

## 📊 Database Schema

```sql
users           -- ข้อมูลผู้ใช้ (เชื่อมกับ Cognito)
health_records  -- บันทึกสุขภาพ (ความดัน, น้ำตาล, น้ำหนัก)
medications     -- รายการยา
medical_documents -- เอกสารทางการแพทย์ (ลิงก์ S3)
audit_logs      -- บันทึก audit ทุก API call
```

---

## 🔐 Security

- JWT Authentication ผ่าน AWS Cognito
- SSL/TLS บน RDS (rejectUnauthorized)
- S3 Block Public Access + KMS Encryption
- Rate Limiting (100 req/15 min)
- Helmet.js HTTP Security Headers
- Audit Log ทุก API Request
- IAM Least Privilege Policy

---

## 📱 หน้าเว็บไซต์ (10 หน้า)

| หน้า | URL | คำอธิบาย |
|------|-----|-----------|
| Login | /login | เข้าสู่ระบบ |
| Register | /register | สมัครสมาชิก + Email Verification |
| Dashboard | /dashboard | ภาพรวมสุขภาพ |
| Health Records | /health-records | รายการบันทึกสุขภาพ |
| Health Form | /health-records/new | เพิ่ม/แก้ไขบันทึก |
| Health Chart | /health-chart | กราฟสุขภาพ (Recharts) |
| Medications | /medications | รายการยา |
| Documents | /documents | รายการเอกสาร |
| Upload | /documents/upload | อัปโหลดไฟล์ → S3 |
| Profile | /profile | ข้อมูลส่วนตัว + กรุ๊ปเลือด |

---

## 📡 API Endpoints

### Health Records
```
GET    /api/health-records        ดึงรายการทั้งหมด
POST   /api/health-records        เพิ่มบันทึก
PUT    /api/health-records/:id    แก้ไขบันทึก
DELETE /api/health-records/:id    ลบบันทึก
GET    /api/health-records/summary/chart  ข้อมูลกราฟ
```

### Medications
```
GET    /api/medications        รายการยา
POST   /api/medications        เพิ่มยา
PUT    /api/medications/:id    แก้ไขยา
DELETE /api/medications/:id    ลบยา
```

### Documents
```
GET    /api/documents              รายการเอกสาร
POST   /api/documents/upload-url   ขอ Presigned URL
POST   /api/documents              บันทึกข้อมูลเอกสาร
GET    /api/documents/:id/download-url  ขอ URL ดาวน์โหลด
```

### Users
```
GET    /api/users/profile    ดึงโปรไฟล์
POST   /api/users/profile    สร้างโปรไฟล์
PUT    /api/users/profile    อัปเดตโปรไฟล์
```

---

## 👨‍💻 ผู้พัฒนา

โปรเจคนี้พัฒนาเพื่อการศึกษา — AWS Cloud Computing Course
