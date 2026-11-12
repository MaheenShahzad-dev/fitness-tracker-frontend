import apiConfig from '../config/apiConfig';
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export async function getAnalytics() {
  const response = await apiConfig.get('/reports', {
    headers: getAuthHeaders(),
  });
  return response.data; 
}