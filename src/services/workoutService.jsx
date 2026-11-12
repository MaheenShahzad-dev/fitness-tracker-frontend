import apiConfig from '../config/apiConfig';
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export async function getWorkouts() {
  const response = await apiConfig.get('/workouts', {
    headers: getAuthHeaders(),
  });
  return response.data; 
}

export async function createWorkout(data) {
  const response = await apiConfig.post('/workouts', data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getWorkoutById(id) {
  const response = await apiConfig.get(`/workouts/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function updateWorkout(id, data) {
  const response = await apiConfig.put(`/workouts/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function deleteWorkout(id) {
  const response = await apiConfig.delete(`/workouts/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}