import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify, Auth } from 'aws-amplify';
import awsConfig from './aws-config';

import './styles/global.css';

import Layout from './components/Layout/Layout';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import Dashboard from './components/Dashboard/Dashboard';
import HealthRecordList from './components/HealthRecords/HealthRecordList';
import HealthRecordForm from './components/HealthRecords/HealthRecordForm';
import HealthChart from './components/HealthRecords/HealthChart';
import MedicationList from './components/Medications/MedicationList';
import MedicationForm from './components/Medications/MedicationForm';
import DocumentList from './components/Documents/DocumentList';
import DocumentUpload from './components/Documents/DocumentUpload';
import UserProfile from './components/Profile/UserProfile';

Amplify.configure(awsConfig);

function PrivateRoute({ children, user }) {
  if (!user) return <Navigate to="/login" replace />;
  return <Layout user={user}>{children}</Layout>;
}

function PublicRoute({ children, user }) {
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const u = await Auth.currentAuthenticatedUser();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#F0F4F8',
        fontFamily: 'Sarabun, sans-serif', fontSize: '16px', color: '#64748b'
      }}>
        กำลังโหลด...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute user={user}>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute user={user}>
            <RegisterPage />
          </PublicRoute>
        } />

        <Route path="/dashboard" element={
          <PrivateRoute user={user}>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/health-records" element={
          <PrivateRoute user={user}>
            <HealthRecordList />
          </PrivateRoute>
        } />
        <Route path="/health-records/new" element={
          <PrivateRoute user={user}>
            <HealthRecordForm />
          </PrivateRoute>
        } />
        <Route path="/health-records/edit/:id" element={
          <PrivateRoute user={user}>
            <HealthRecordForm />
          </PrivateRoute>
        } />
        <Route path="/health-chart" element={
          <PrivateRoute user={user}>
            <HealthChart />
          </PrivateRoute>
        } />
        <Route path="/medications" element={
          <PrivateRoute user={user}>
            <MedicationList />
          </PrivateRoute>
        } />
        <Route path="/medications/new" element={
          <PrivateRoute user={user}>
            <MedicationForm />
          </PrivateRoute>
        } />
        <Route path="/medications/edit/:id" element={
          <PrivateRoute user={user}>
            <MedicationForm />
          </PrivateRoute>
        } />
        <Route path="/documents" element={
          <PrivateRoute user={user}>
            <DocumentList />
          </PrivateRoute>
        } />
        <Route path="/documents/upload" element={
          <PrivateRoute user={user}>
            <DocumentUpload />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute user={user}>
            <UserProfile />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
