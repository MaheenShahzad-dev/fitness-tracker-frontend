
import apiConfig from '../config/apiConfig';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

export const getProgress = async (params = {}) => {
  const response = await apiConfig.get('/progress', {
    headers: getAuthHeaders(),
    params,
  });

  return response.data;
};

export const createProgress = async (progressData) => {
  const response = await apiConfig.post('/progress', progressData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const updateProgress = async (id, progressData) => {
  const response = await apiConfig.put(`/progress/${id}`, progressData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const deleteProgress = async (id) => {
  const response = await apiConfig.delete(`/progress/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};
