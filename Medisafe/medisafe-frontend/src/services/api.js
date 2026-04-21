import { Auth } from 'aws-amplify';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const getAuthHeader = async () => {
  const session = await Auth.currentSession();
  const token = session.getIdToken().getJwtToken();
  return { Authorization: `Bearer ${token}` };
};

const apiRequest = async (method, endpoint, body = null) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader())
  };
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API Error');
  }
  return response.json();
};

export const healthRecordsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest('GET', `/api/health-records?${query}`);
  },
  create: (data) => apiRequest('POST', '/api/health-records', data),
  update: (id, data) => apiRequest('PUT', `/api/health-records/${id}`, data),
  delete: (id) => apiRequest('DELETE', `/api/health-records/${id}`),
  getChartData: (type, days) =>
    apiRequest('GET', `/api/health-records/summary/chart?type=${type}&days=${days}`)
};

export const medicationsAPI = {
  getAll: () => apiRequest('GET', '/api/medications'),
  create: (data) => apiRequest('POST', '/api/medications', data),
  update: (id, data) => apiRequest('PUT', `/api/medications/${id}`, data),
  delete: (id) => apiRequest('DELETE', `/api/medications/${id}`)
};

export const documentsAPI = {
  getAll: () => apiRequest('GET', '/api/documents'),
  getUploadUrl: (data) => apiRequest('POST', '/api/documents/upload-url', data),
  saveDocument: (data) => apiRequest('POST', '/api/documents', data),
  getDownloadUrl: (id) => apiRequest('GET', `/api/documents/${id}/download-url`),
  delete: (id) => apiRequest('DELETE', `/api/documents/${id}`)
};

export const usersAPI = {
  getProfile: () => apiRequest('GET', '/api/users/profile'),
  updateProfile: (data) => apiRequest('PUT', '/api/users/profile', data)
};