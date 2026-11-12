import apiConfig from '../config/apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export async function getNutrition(params = {}) {
  const response = await apiConfig.get('/nutrition', {
    headers: getAuthHeaders(),
    params: params 
  });
  return response.data; 
}

export async function createNutrition(data) {
  const response = await apiConfig.post('/nutrition', data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getNutritionById(id) {
  const response = await apiConfig.get(`/nutrition/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function updateNutrition(id, data) {
  const response = await apiConfig.put(`/nutrition/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function deleteNutrition(id) {
  const response = await apiConfig.delete(`/nutrition/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}