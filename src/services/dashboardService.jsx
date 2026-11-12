import apiConfig from '../config/apiConfig';

export async function getDashboard() {
  const token = localStorage.getItem('token');
  
  const response = await apiConfig.get('/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json'
    },
  });
  
  return response.data;
}