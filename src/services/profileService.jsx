import apiConfig from '../config/apiConfig';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

export async function getProfile() {
  const response = await apiConfig.get('/user/profile', {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function updateProfile(data) {
  const response = await apiConfig.put('/user/profile', data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function updateProfilePic(formData) {
  const response = await apiConfig.put('/user/profile-pic', formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
}

export async function getProfileWorkouts(params = {}) {
  const response = await apiConfig.get('/workouts', {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
}

export async function getProfileNutrition(params = {}) {
  const response = await apiConfig.get('/nutrition', {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
}

export async function getProfileProgress(params = {}) {
  const response = await apiConfig.get('/progress', {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
}

export async function createProfileProgress(data) {
  const response = await apiConfig.post('/progress', data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function updateProfileProgress(id, data) {
  const response = await apiConfig.put(`/progress/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getProfileGoal() {
  const response = await apiConfig.get('/goals', {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function updateProfileGoal(data) {
  const response = await apiConfig.put('/goals', data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}