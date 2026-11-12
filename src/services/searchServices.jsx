
import apiConfig from '../config/apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const searchWorkouts = async (search = '') => {
  const response = await apiConfig.get('/workouts', {
    params: { search, page: 1, limit: 4 },
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const searchNutrition = async (search = '') => {
  const response = await apiConfig.get('/nutrition', {
    params: { search, page: 1, limit: 4 },
    headers: getAuthHeaders(),
  });

  return response.data;
};


export const searchProgress = async (search = '') => {
  const response = await apiConfig.get('/progress', {
    params: { search, page: 1, limit: 4 },
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const searchNotifications = async (search = '') => {
  const response = await apiConfig.get('/notifications', {
    params: { search, page: 1, limit: 4 },
    headers: getAuthHeaders(),
  });

  return response.data;
};
